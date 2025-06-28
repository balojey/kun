'use client';

import { createClient } from '@/lib/supabase/client';

export interface TokenBalance {
  balance: number;
  total_purchased: number;
  total_consumed: number;
}

export interface TokenTransaction {
  id: string;
  type: 'purchase' | 'consumption' | 'bonus';
  amount: number;
  balance_after: number;
  description: string;
  metadata: any;
  created_at: string;
}

/**
 * Get current user's token balance (client-side)
 */
export async function getUserTokenBalance(): Promise<TokenBalance | null> {
  const supabase = createClient();
  
  // Get the current session to get the access token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tokens-balance`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch token balance');
  }

  return response.json();
}

/**
 * Get current user's token transactions (client-side)
 */
export async function getUserTokenTransactions(
  limit: number = 50,
  offset: number = 0
): Promise<TokenTransaction[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('token_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching token transactions:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Calculate estimated usage time for current balance
 */
export async function getEstimatedUsageTime(): Promise<{
  conversational_ai_minutes: number;
  pica_endpoint_minutes: number;
} | null> {
  const balance = await getUserTokenBalance();
  
  if (!balance) return null;
  
  return {
    conversational_ai_minutes: Math.floor(balance.balance / (4.5 * 60)), // 4.5 tokens per second = 270 tokens per minute
    pica_endpoint_minutes: Math.floor(balance.balance / (2 * 60)), // 2 tokens per second = 120 tokens per minute
  };
}

/**
 * Subscribe to token balance changes using polling instead of realtime
 */
export function subscribeToTokenBalance(
  callback: (balance: TokenBalance | null) => void
) {
  const supabase = createClient();

  // Subscribe to changes on the token_balances table for the current user
  const channel = supabase
    .channel('realtime:token_balances')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'token_balances',
      },
      async (payload) => {
        try {
          const balance = await getUserTokenBalance();
          callback(balance);
        } catch (error) {
          console.error('Error fetching token balance (realtime):', error);
        }
      }
    )
    .subscribe();

  // Initial fetch
  getUserTokenBalance()
    .then(callback)
    .catch((error) => {
      console.error('Error fetching initial token balance:', error);
    });

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}