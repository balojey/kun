'use client';

import { useState, useEffect } from 'react';
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

  const fetchTokenData = async () => {
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
  };

  const refreshTokenData = () => {
    fetchTokenData();
  };

  useEffect(() => {
    fetchTokenData();
  }, [user]);

  // Subscribe to real-time balance changes
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTokenBalance((newBalance) => {
      setBalance(newBalance);
      // Refresh estimated time when balance changes
      if (newBalance) {
        getEstimatedUsageTime().then(setEstimatedTime);
      }
    });

    return unsubscribe;
  }, [user]);

  const hassufficientTokens = (requiredTokens: number): boolean => {
    return balance ? balance.balance >= requiredTokens : false;
  };

  const getTokensForDuration = (
    serviceType: 'conversational_ai' | 'pica_endpoint',
    durationSeconds: number
  ): number => {
    if (serviceType === 'conversational_ai') {
      return durationSeconds; // 1 token per second
    } else {
      return Math.ceil(durationSeconds * 0.5); // 0.5 tokens per second
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