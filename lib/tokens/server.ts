import { createClient } from '@/lib/supabase/server';

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

export interface UsageSession {
  id: string;
  service_type: 'conversational_ai' | 'pica_endpoint';
  session_id: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  tokens_consumed?: number;
  status: 'active' | 'completed' | 'cancelled';
}

/**
 * Get user's token balance
 */
export async function getUserTokenBalance(userId: string): Promise<TokenBalance | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_tokens')
    .select('balance, total_purchased, total_consumed')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching token balance:', error);
    return null;
  }
  
  return data;
}

/**
 * Initialize tokens for a new user (10,000 free tokens)
 */
export async function initializeUserTokens(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase.rpc('initialize_user_tokens', {
    user_id_param: userId
  });
  
  if (error) {
    console.error('Error initializing user tokens:', error);
    return false;
  }
  
  return true;
}

/**
 * Add tokens to user account (from purchases)
 */
export async function addTokens(
  userId: string,
  amount: number,
  description: string,
  metadata: any = {}
): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase.rpc('add_tokens', {
    user_id_param: userId,
    amount_param: amount,
    description_param: description,
    metadata_param: metadata
  });
  
  if (error) {
    console.error('Error adding tokens:', error);
    return false;
  }
  
  return true;
}

/**
 * Deduct tokens from user account
 */
export async function deductTokens(
  userId: string,
  amount: number,
  description: string,
  metadata: any = {}
): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('deduct_tokens', {
    user_id_param: userId,
    amount_param: amount,
    description_param: description,
    metadata_param: metadata
  });
  
  if (error) {
    console.error('Error deducting tokens:', error);
    return false;
  }
  
  return data; // Returns boolean indicating success
}

/**
 * Start a usage session
 */
export async function startUsageSession(
  userId: string,
  serviceType: 'conversational_ai' | 'pica_endpoint',
  sessionId: string
): Promise<string | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('start_usage_session', {
    user_id_param: userId,
    service_type_param: serviceType,
    session_id_param: sessionId
  });
  
  if (error) {
    console.error('Error starting usage session:', error);
    return null;
  }
  
  return data; // Returns session UUID
}

/**
 * End a usage session and deduct tokens
 */
export async function endUsageSession(
  sessionId: string,
  durationSeconds: number
): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('end_usage_session', {
    session_id_param: sessionId,
    duration_seconds_param: durationSeconds
  });
  
  if (error) {
    console.error('Error ending usage session:', error);
    return false;
  }
  
  return data; // Returns boolean indicating success
}

/**
 * Get user's token transactions
 */
export async function getUserTokenTransactions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<TokenTransaction[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('token_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching token transactions:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get user's usage sessions
 */
export async function getUserUsageSessions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<UsageSession[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('token_usage_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching usage sessions:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Check if user has sufficient tokens
 */
export async function hassufficientTokens(
  userId: string,
  requiredTokens: number
): Promise<boolean> {
  const balance = await getUserTokenBalance(userId);
  return balance ? balance.balance >= requiredTokens : false;
}

/**
 * Calculate estimated usage time for user's current balance
 */
export async function getEstimatedUsageTime(userId: string): Promise<{
  conversational_ai_minutes: number;
  pica_endpoint_minutes: number;
} | null> {
  const balance = await getUserTokenBalance(userId);
  
  if (!balance) return null;
  
  return {
    conversational_ai_minutes: Math.floor(balance.balance / 60), // 1 token per second = 60 tokens per minute
    pica_endpoint_minutes: Math.floor(balance.balance / 30), // 0.5 tokens per second = 30 tokens per minute
  };
}