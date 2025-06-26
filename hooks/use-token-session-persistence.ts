'use client';

import { useEffect, useRef } from 'react';
import { useTokenSession } from '@/hooks/use-token-session';

interface SessionPersistenceOptions {
  serviceType: 'conversational_ai' | 'pica_endpoint';
  isActive: boolean;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: () => void;
  onInsufficientTokens?: () => void;
}

export function useTokenSessionPersistence({
  serviceType,
  isActive,
  onSessionStart,
  onSessionEnd,
  onInsufficientTokens,
}: SessionPersistenceOptions) {
  const {
    currentSession,
    loading,
    error,
    startSession,
    endSession,
    getCurrentDuration,
    getEstimatedTokens,
    checkTokenSufficiency,
  } = useTokenSession();

  const persistenceKey = `token_session_${serviceType}`;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save session state to localStorage
  const saveSessionState = (sessionData: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(persistenceKey, JSON.stringify({
        ...sessionData,
        lastUpdate: Date.now(),
      }));
    }
  };

  // Load session state from localStorage
  const loadSessionState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(persistenceKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Check if session is not too old (max 1 hour)
          if (Date.now() - parsed.lastUpdate < 3600000) {
            return parsed;
          }
        } catch (error) {
          console.error('Error parsing saved session:', error);
        }
      }
    }
    return null;
  };

  // Clear session state from localStorage
  const clearSessionState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(persistenceKey);
    }
  };

  // Restore session on mount if needed
  useEffect(() => {
    const savedSession = loadSessionState();
    if (savedSession && isActive && !currentSession?.isActive) {
      // Try to restore the session
      console.log('Attempting to restore session:', savedSession);
      // Note: We can't actually restore the backend session, but we can track the time
      // The session will be handled by the normal flow
    }
  }, []);

  // Save session state when it changes
  useEffect(() => {
    if (currentSession?.isActive) {
      saveSessionState(currentSession);
      
      // Set up periodic saving
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        if (currentSession?.isActive) {
          saveSessionState({
            ...currentSession,
            currentDuration: getCurrentDuration(),
            estimatedTokens: getEstimatedTokens(),
          });
        }
      }, 5000); // Save every 5 seconds
    } else {
      clearSessionState();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentSession, getCurrentDuration, getEstimatedTokens]);

  // Handle session lifecycle
  useEffect(() => {
    const handleSessionChange = async () => {
      if (isActive && !currentSession?.isActive) {
        // Check if user has sufficient tokens for at least 30 seconds
        const minTokens = serviceType === 'conversational_ai' ? 30 : 15;
        const hasSufficientTokens = await checkTokenSufficiency(minTokens);
        
        if (!hasSufficientTokens) {
          onInsufficientTokens?.();
          return;
        }

        const sessionId = await startSession(serviceType);
        if (sessionId) {
          onSessionStart?.(sessionId);
        }
      } else if (!isActive && currentSession?.isActive) {
        const success = await endSession();
        if (success) {
          onSessionEnd?.();
        }
        clearSessionState();
      }
    };

    handleSessionChange();
  }, [isActive, currentSession?.isActive, serviceType, startSession, endSession, checkTokenSufficiency, onSessionStart, onSessionEnd, onInsufficientTokens]);

  // Handle page unload - try to end session gracefully
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSession?.isActive) {
        // Save final state
        saveSessionState({
          ...currentSession,
          currentDuration: getCurrentDuration(),
          estimatedTokens: getEstimatedTokens(),
          needsCleanup: true,
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && currentSession?.isActive) {
        // Save state when tab becomes hidden
        saveSessionState({
          ...currentSession,
          currentDuration: getCurrentDuration(),
          estimatedTokens: getEstimatedTokens(),
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentSession, getCurrentDuration, getEstimatedTokens]);

  return {
    currentSession,
    loading,
    error,
    getCurrentDuration,
    getEstimatedTokens,
    checkTokenSufficiency,
  };
}