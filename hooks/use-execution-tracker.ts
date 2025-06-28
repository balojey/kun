'use client';

import { useState, useRef, useCallback } from 'react';

interface ExecutionState {
  isExecuting: boolean;
  startTime: number | null;
}

export function useExecutionTracker(serviceType: 'conversational_ai' | 'pica_endpoint') {
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isExecuting: false,
    startTime: null,
  });
  const [executionDuration, setExecutionDuration] = useState(0);
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const hassufficientTokens = useCallback((requiredTokens: number): boolean => {
    // This is now just a UI helper - actual token checking happens server-side
    // Return true to allow UI interactions, server will handle validation
    return true;
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
    });

    // Start tracking duration for UI feedback only
    intervalRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      setExecutionDuration(duration);
      
      // Calculate estimated tokens for UI display
      const tokens = serviceType === 'conversational_ai' 
        ? duration 
        : Math.ceil(duration * 0.5);
      setEstimatedTokens(tokens);
    }, 1000);

    console.log(`Started ${serviceType} execution tracking (UI only)`);
  }, [executionState.isExecuting, serviceType]);

  const endExecution = useCallback(() => {
    if (!executionState.isExecuting) {
      console.warn('No active execution to end');
      return;
    }

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset state
    setExecutionState({
      isExecuting: false,
      startTime: null,
    });
    setExecutionDuration(0);
    setEstimatedTokens(0);

    console.log(`Ended ${serviceType} execution tracking (UI only)`);
  }, [executionState, serviceType]);

  return {
    isExecuting: executionState.isExecuting,
    executionDuration,
    estimatedTokens,
    startExecution,
    endExecution,
    hassufficientTokens,
  };
}