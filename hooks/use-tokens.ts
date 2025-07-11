'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/components/auth/auth-provider';
import { 
  getUserTokenBalance, 
  getUserTokenTransactions, 
  getEstimatedUsageTime,
  subscribeToTokenBalance,
  type TokenBalance,
  type TokenTransaction
} from '@/lib/tokens/client';

export function useTokens() {
  const { user } = useAuthContext();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<{
    conversational_ai_minutes: number;
    pica_endpoint_minutes: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenData = useCallback(async () => {
    if (!user) {
      setBalance(null);
      setTransactions([]);
      setEstimatedTime(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [balanceData, transactionsData, timeData] = await Promise.all([
        getUserTokenBalance(),
        getUserTokenTransactions(20),
        getEstimatedUsageTime()
      ]);

      setBalance(balanceData);
      setTransactions(transactionsData);
      setEstimatedTime(timeData);
    } catch (err) {
      console.error('Failed to fetch token data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch token data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshTokenData = () => {
    fetchTokenData();
  };

  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData, user]);

  // Subscribe to balance changes using polling instead of realtime
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTokenBalance((newBalance) => {
      setBalance(newBalance);
      // Refresh estimated time when balance changes
      if (newBalance) {
        getEstimatedUsageTime().then(setEstimatedTime).catch(console.error);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user]);

  const hassufficientTokens = (requiredTokens: number): boolean => {
    return balance ? balance.balance >= requiredTokens : false;
  };

  const getTokensForDuration = (
    serviceType: 'conversational_ai' | 'pica_endpoint',
    durationSeconds: number
  ): number => {
    if (serviceType === 'conversational_ai') {
      return Math.ceil(durationSeconds * 4.5); // 4.5 tokens per second
    } else {
      return Math.ceil(durationSeconds * 2); // 2 tokens per second
    }
  };

  return {
    balance,
    transactions,
    estimatedTime,
    loading,
    error,
    refreshTokenData,
    hassufficientTokens,
    getTokensForDuration,
  };
}