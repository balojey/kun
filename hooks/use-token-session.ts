'use client';

import { useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TokenSession {
  sessionId: string;
  serviceType: 'conversational_ai' | 'pica_endpoint';
  startTime: number;
  isActive: boolean;
}

export function useTokenSession() {
  const [currentSession, setCurrentSession] = useState<TokenSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getAuthHeaders = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  };

  const startSession = useCallback(async (
    serviceType: 'conversational_ai' | 'pica_endpoint',
    estimatedDurationSeconds?: number
  ): Promise<string | null> => {
    if (currentSession?.isActive) {
      console.warn('Session already active');
      return currentSession.sessionId;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/tokens/session/start', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          service_type: serviceType,
          estimated_duration_seconds: estimatedDurationSeconds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start session');
      }

      const { session_id } = await response.json();

      const session: TokenSession = {
        sessionId: session_id,
        serviceType,
        startTime: Date.now(),
        isActive: true,
      };

      setCurrentSession(session);
      return session_id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      console.error('Error starting token session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const endSession = useCallback(async (): Promise<boolean> => {
    if (!currentSession?.isActive) {
      console.warn('No active session to end');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const durationSeconds = Math.floor((Date.now() - currentSession.startTime) / 1000);

      const response = await fetch('/api/tokens/session/end', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: currentSession.sessionId,
          duration_seconds: durationSeconds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to end session');
      }

      setCurrentSession(null);
      
      // Clear any running interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      setError(errorMessage);
      console.error('Error ending token session:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const getCurrentDuration = useCallback((): number => {
    if (!currentSession?.isActive) return 0;
    return Math.floor((Date.now() - currentSession.startTime) / 1000);
  }, [currentSession]);

  const getEstimatedTokens = useCallback((): number => {
    if (!currentSession?.isActive) return 0;
    const duration = getCurrentDuration();
    return currentSession.serviceType === 'conversational_ai' 
      ? duration 
      : Math.ceil(duration * 0.5);
  }, [currentSession, getCurrentDuration]);

  const checkTokenSufficiency = useCallback(async (requiredTokens: number): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/tokens/check', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          required_tokens: requiredTokens,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const { sufficient } = await response.json();
      return sufficient;
    } catch (err) {
      console.error('Error checking token sufficiency:', err);
      return false;
    }
  }, []);

  return {
    currentSession,
    loading,
    error,
    startSession,
    endSession,
    getCurrentDuration,
    getEstimatedTokens,
    checkTokenSufficiency,
  };
}