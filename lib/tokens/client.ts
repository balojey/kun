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
  
  const { data, error } = await supabase
    .from('user_tokens')
    .select('balance, total_purchased, total_consumed')
    .single();
  
  if (error) {
    console.error('Error fetching token balance:', error);
    return null;
  }
  
  return data;
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
 * Subscribe to token balance changes
 */
export function subscribeToTokenBalance(
  callback: (balance: TokenBalance | null) => void
) {
  const supabase = createClient();
  
  const subscription = supabase
    .channel('token_balance_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_tokens',
      },
      async () => {
        const balance = await getUserTokenBalance();
        callback(balance);
      }
    )
    .subscribe();
  
  return () => subscription.unsubscribe();
}