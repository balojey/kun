'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ExecutionState {
  isExecuting: boolean;
  startTime: number | null;
  serviceType: 'conversational_ai' | 'pica_endpoint';
}

export function useExecutionTracker(serviceType: 'conversational_ai' | 'pica_endpoint') {
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isExecuting: false,
    startTime: null,
    serviceType,
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

  const startExecution = useCallback(() => {
    if (executionState.isExecuting) {
      console.warn('Execution already active');
      return;
    }

    const startTime = Date.now();
    setExecutionState({
      isExecuting: true,
      startTime,
      serviceType,
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

    console.log(`Started ${serviceType} execution tracking`);
  }, [executionState.isExecuting, serviceType]);

  const endExecution = useCallback(async () => {
    if (!executionState.isExecuting || !executionState.startTime) {
      console.warn('No active execution to end');
      return;
    }

    const durationSeconds = Math.floor((Date.now() - executionState.startTime) / 1000);
    
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
    });
    setExecutionDuration(0);
    setEstimatedTokens(0);

    // Deduct tokens for the execution
    try {
      const headers = await getAuthHeaders();
      const tokensToDeduct = serviceType === 'conversational_ai' 
        ? durationSeconds 
        : Math.ceil(durationSeconds * 0.5);

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tokens-deduct`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: tokensToDeduct,
          description: `${serviceType} execution for ${durationSeconds} seconds`,
          metadata: {
            service_type: serviceType,
            duration_seconds: durationSeconds,
            execution_end: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        console.error('Failed to deduct tokens for execution');
      } else {
        console.log(`Deducted ${tokensToDeduct} tokens for ${serviceType} execution`);
      }
    } catch (error) {
      console.error('Error deducting tokens:', error);
    }
  }, [executionState, serviceType]);

  // Handle page unload - try to end execution gracefully
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (executionState.isExecuting && executionState.startTime) {
        const durationSeconds = Math.floor((Date.now() - executionState.startTime) / 1000);
        const tokensToDeduct = serviceType === 'conversational_ai' 
          ? durationSeconds 
          : Math.ceil(durationSeconds * 0.5);

        // Use sendBeacon for reliable token deduction on page unload
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tokens-deduct`,
          JSON.stringify({
            amount: tokensToDeduct,
            description: `${serviceType} execution ended on page unload (${durationSeconds}s)`,
            metadata: {
              service_type: serviceType,
              duration_seconds: durationSeconds,
              ended_by: 'page_unload',
            },
          })
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