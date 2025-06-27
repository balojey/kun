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
    conversational_ai_minutes: Math.floor(balance.balance / 60), // 1 token per second = 60 tokens per minute
    pica_endpoint_minutes: Math.floor(balance.balance / 30), // 0.5 tokens per second = 30 tokens per minute
  };
}

/**
 * Subscribe to token balance changes using polling instead of realtime
 */
export function subscribeToTokenBalance(
  callback: (balance: TokenBalance | null) => void
) {
  let intervalId: NodeJS.Timeout;
  let isActive = true;

  const pollBalance = async () => {
    if (!isActive) return;
    
    try {
      const balance = await getUserTokenBalance();
      callback(balance);
    } catch (error) {
      console.error('Error polling token balance:', error);
      // Don't call callback on error to avoid infinite loading states
    }
  };

  // Initial fetch
  pollBalance();

  // Poll every 30 seconds
  intervalId = setInterval(pollBalance, 30000);

  // Return cleanup function
  return () => {
    isActive = false;
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}