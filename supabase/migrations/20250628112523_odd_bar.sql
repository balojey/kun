/*
  # Conversation Sessions and Real-Time Token System

  1. New Tables
    - `conversation_sessions`: Active conversation tracking
      - `id` (uuid, primary key)
      - `user_id` (text, Supabase User ID)
      - `conversation_id` (text, ElevenLabs conversation ID)
      - `status` (text, conversation status)
      - `conversation_duration` (float, duration in seconds)
      - `created_at` (timestamptz)

    - `conversation_history`: Completed conversation archive
      - Same schema as conversation_sessions for long-term storage

  2. New Functions
    - `check_tokens_for_execution`: Pre-execution token validation
    - `deduct_tokens_for_execution`: Real-time token deduction based on execution time
    - `deduct_tokens_for_conversation`: Conversation-based token deduction

  3. Security
    - Enable RLS on new tables
    - Service role policies for system operations
    - Secure token deduction functions
*/

-- Create conversation_sessions table
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  conversation_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'initiated',
  conversation_duration float DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create conversation_history table (identical schema for archival)
CREATE TABLE IF NOT EXISTS conversation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  conversation_id text NOT NULL,
  status text NOT NULL,
  conversation_duration float NOT NULL,
  created_at timestamptz NOT NULL,
  completed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_sessions
CREATE POLICY "Users can view their own conversation sessions"
  ON conversation_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own conversation sessions"
  ON conversation_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- RLS Policies for conversation_history
CREATE POLICY "Users can view their own conversation history"
  ON conversation_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Service role policies for system operations
CREATE POLICY "Service role can manage all conversation sessions"
  ON conversation_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage all conversation history"
  ON conversation_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS conversation_sessions_user_id_idx ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS conversation_sessions_conversation_id_idx ON conversation_sessions(conversation_id);
CREATE INDEX IF NOT EXISTS conversation_sessions_status_idx ON conversation_sessions(status);
CREATE INDEX IF NOT EXISTS conversation_history_user_id_idx ON conversation_history(user_id);

-- Function to check if user has sufficient tokens for execution
CREATE OR REPLACE FUNCTION check_tokens_for_execution(
  user_id_param text,
  estimated_seconds_param float DEFAULT 10.0
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance bigint;
  required_tokens bigint;
BEGIN
  -- Calculate required tokens (0.5 tokens per second)
  required_tokens := CEIL(estimated_seconds_param * 0.5);
  
  -- Get current balance
  SELECT balance INTO current_balance
  FROM public.user_tokens
  WHERE user_id = user_id_param::uuid;
  
  -- Return false if user not found or insufficient balance
  IF current_balance IS NULL OR current_balance < required_tokens THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Function to deduct tokens based on execution time
CREATE OR REPLACE FUNCTION deduct_tokens_for_execution(
  user_id_param text,
  execution_seconds_param float,
  description_param text,
  metadata_param jsonb DEFAULT '{}'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tokens_to_deduct bigint;
  current_balance bigint;
  new_balance bigint;
BEGIN
  -- Calculate tokens to deduct (0.5 tokens per second)
  tokens_to_deduct := CEIL(execution_seconds_param * 0.5);
  
  -- Skip if no tokens to deduct
  IF tokens_to_deduct <= 0 THEN
    RETURN true;
  END IF;
  
  -- Lock the user's token record for update
  SELECT balance INTO current_balance
  FROM public.user_tokens
  WHERE user_id = user_id_param::uuid
  FOR UPDATE;
  
  -- Check if user exists and has sufficient tokens
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User token account not found';
  END IF;
  
  -- Calculate new balance (don't go below 0)
  new_balance := GREATEST(0, current_balance - tokens_to_deduct);
  tokens_to_deduct := current_balance - new_balance;
  
  -- Update user balance and total consumed
  UPDATE public.user_tokens
  SET 
    balance = new_balance,
    total_consumed = total_consumed + tokens_to_deduct,
    updated_at = now()
  WHERE user_id = user_id_param::uuid;
  
  -- Record the transaction
  INSERT INTO public.token_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (user_id_param::uuid, 'consumption', -tokens_to_deduct, new_balance, description_param, metadata_param);
  
  RETURN true;
END;
$$;

-- Function to deduct tokens for conversation duration
CREATE OR REPLACE FUNCTION deduct_tokens_for_conversation(
  user_id_param text,
  conversation_duration_param float,
  conversation_id_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tokens_to_deduct bigint;
  current_balance bigint;
  new_balance bigint;
BEGIN
  -- Calculate tokens to deduct (1 token per second for conversations)
  tokens_to_deduct := CEIL(conversation_duration_param);
  
  -- Skip if no tokens to deduct
  IF tokens_to_deduct <= 0 THEN
    RETURN true;
  END IF;
  
  -- Lock the user's token record for update
  SELECT balance INTO current_balance
  FROM public.user_tokens
  WHERE user_id = user_id_param::uuid
  FOR UPDATE;
  
  -- Check if user exists
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User token account not found';
  END IF;
  
  -- Calculate new balance (don't go below 0)
  new_balance := GREATEST(0, current_balance - tokens_to_deduct);
  tokens_to_deduct := current_balance - new_balance;
  
  -- Update user balance and total consumed
  UPDATE public.user_tokens
  SET 
    balance = new_balance,
    total_consumed = total_consumed + tokens_to_deduct,
    updated_at = now()
  WHERE user_id = user_id_param::uuid;
  
  -- Record the transaction
  INSERT INTO public.token_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (
    user_id_param::uuid, 
    'consumption', 
    -tokens_to_deduct, 
    new_balance, 
    'Voice conversation - ' || conversation_duration_param || ' seconds',
    jsonb_build_object(
      'conversation_id', conversation_id_param,
      'duration_seconds', conversation_duration_param,
      'service_type', 'conversational_ai'
    )
  );
  
  RETURN true;
END;
$$;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION check_tokens_for_execution(text, float) TO service_role;
GRANT EXECUTE ON FUNCTION deduct_tokens_for_execution(text, float, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION deduct_tokens_for_conversation(text, float, text) TO service_role;