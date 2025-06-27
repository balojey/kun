'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ExecutionState {
  isExecuting: boolean;
  startTime: number | null;
  serviceType: 'conversational_ai' | 'pica_endpoint';
  dbSessionUuid: string | null;
}

export function useExecutionTracker(serviceType: 'conversational_ai' | 'pica_endpoint') {
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isExecuting: false,
    startTime: null,
    serviceType,
    dbSessionUuid: null,
  });
  const [executionDuration, setExecutionDuration] = useState(0);
  const [estimatedTokens, setEstimatedTokens] = useState(0);
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

  const hassufficientTokens = useCallback(async (requiredTokens: number): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tokens-check`, {
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

  const startExecution = useCallback(async () => {
    if (executionState.isExecuting) {
      console.warn('Execution already active');
      return;
    }

    try {
      // Start database session first
      const headers = await getAuthHeaders();
      const estimatedDurationSeconds = serviceType === 'conversational_ai' ? 30 : 5;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tokens-session-start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          service_type: serviceType,
          estimated_duration_seconds: estimatedDurationSeconds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start usage session');
      }

      const { session_id, session_uuid } = await response.json();
      console.log(`Started database session: ${session_uuid} for ${serviceType}`);

      const startTime = Date.now();
      setExecutionState({
        isExecuting: true,
        startTime,
        serviceType,
        dbSessionUuid: session_uuid,
      });

      // Start tracking duration
      intervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        setExecutionDuration(duration);
        
        // Calculate estimated tokens based on service type
        const tokens = serviceType === 'conversational_ai' 
          ? duration 
          : Math.ceil(duration * 0.5);
        setEstimatedTokens(tokens);
      }, 1000);

      console.log(`Started ${serviceType} execution tracking with session ${session_uuid}`);
    } catch (error) {
      console.error('Failed to start execution:', error);
      throw error;
    }
  }, [executionState.isExecuting, serviceType]);

  const endExecution = useCallback(async () => {
    if (!executionState.isExecuting || !executionState.startTime || !executionState.dbSessionUuid) {
      console.warn('No active execution to end');
      return;
    }

    const durationSeconds = Math.floor((Date.now() - executionState.startTime) / 1000);
    const sessionUuid = executionState.dbSessionUuid;
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset state
    setExecutionState({
      isExecuting: false,
      startTime: null,
      serviceType,
      dbSessionUuid: null,
    });
    setExecutionDuration(0);
    setEstimatedTokens(0);

    // End database session and deduct tokens
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tokens-session-end`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionUuid,
          duration_seconds: durationSeconds,
        }),
      });

      if (!response.ok) {
        console.error('Failed to end session properly');
        return;
      }

      const { success } = await response.json();
      if (success) {
        console.log(`Successfully ended session ${sessionUuid} and deducted tokens for ${durationSeconds} seconds`);
      } else {
        console.error('Token deduction failed for session:', sessionUuid);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [executionState, serviceType]);

  // Handle page unload - try to end execution gracefully
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (executionState.isExecuting && executionState.startTime && executionState.dbSessionUuid) {
        const durationSeconds = Math.floor((Date.now() - executionState.startTime) / 1000);
        
        // Use sendBeacon for reliable session ending on page unload
        const payload = JSON.stringify({
          session_id: executionState.dbSessionUuid,
          duration_seconds: durationSeconds,
        });

        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tokens-session-end`,
          payload
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && executionState.isExecuting) {
        // End execution when tab becomes hidden
        endExecution();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up interval on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [executionState, serviceType, endExecution]);

  return {
    isExecuting: executionState.isExecuting,
    executionDuration,
    estimatedTokens,
    startExecution,
    endExecution,
    hassufficientTokens,
  };
}