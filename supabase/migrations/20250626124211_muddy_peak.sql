/*
  # Token-Based Billing System

  1. New Tables
    - `user_tokens`: Stores user token balances
      - `user_id` (uuid, references auth.users)
      - `balance` (bigint, current token balance)
      - `total_purchased` (bigint, lifetime tokens purchased)
      - `total_consumed` (bigint, lifetime tokens consumed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `token_transactions`: Records all token transactions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (enum: 'purchase', 'consumption', 'bonus')
      - `amount` (bigint, positive for credits, negative for debits)
      - `balance_after` (bigint, balance after transaction)
      - `description` (text, transaction description)
      - `metadata` (jsonb, additional data like stripe session, usage details)
      - `created_at` (timestamp)

    - `token_usage_sessions`: Tracks active usage sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `service_type` (enum: 'conversational_ai', 'pica_endpoint')
      - `session_id` (text, unique session identifier)
      - `start_time` (timestamp)
      - `end_time` (timestamp, nullable)
      - `duration_seconds` (integer, nullable)
      - `tokens_consumed` (bigint, nullable)
      - `status` (enum: 'active', 'completed', 'cancelled')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to access their own data only
    - Service role policies for system operations

  3. Functions
    - Function to initialize user tokens (10,000 free tokens)
    - Function to safely deduct tokens with balance checks
    - Function to add tokens from purchases
    - Trigger to auto-create token account on user signup
*/

-- Create enums
CREATE TYPE token_transaction_type AS ENUM ('purchase', 'consumption', 'bonus');
CREATE TYPE token_service_type AS ENUM ('conversational_ai', 'pica_endpoint');
CREATE TYPE token_session_status AS ENUM ('active', 'completed', 'cancelled');

-- User token balances table
CREATE TABLE IF NOT EXISTS user_tokens (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance bigint NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_purchased bigint NOT NULL DEFAULT 0 CHECK (total_purchased >= 0),
  total_consumed bigint NOT NULL DEFAULT 0 CHECK (total_consumed >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Token transactions log
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type public.token_transaction_type NOT NULL,
  amount bigint NOT NULL,
  balance_after bigint NOT NULL CHECK (balance_after >= 0),
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Token usage sessions
CREATE TABLE IF NOT EXISTS token_usage_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_type public.token_service_type NOT NULL,
  session_id text NOT NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  duration_seconds integer,
  tokens_consumed bigint,
  status public.token_session_status NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id)
);

-- Enable RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_usage_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tokens
CREATE POLICY "Users can view their own token balance"
  ON public.user_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for token_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.token_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for token_usage_sessions
CREATE POLICY "Users can view their own usage sessions"
  ON public.token_usage_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage sessions"
  ON public.token_usage_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage sessions"
  ON public.token_usage_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role policies (for system operations)
CREATE POLICY "Service role can manage all token data"
  ON public.user_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage all transactions"
  ON public.token_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage all usage sessions"
  ON public.token_usage_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS user_tokens_user_id_idx ON public.user_tokens(user_id);
CREATE INDEX IF NOT EXISTS token_transactions_user_id_created_at_idx ON public.token_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS token_usage_sessions_user_id_idx ON public.token_usage_sessions(user_id);
CREATE INDEX IF NOT EXISTS token_usage_sessions_session_id_idx ON public.token_usage_sessions(session_id);
CREATE INDEX IF NOT EXISTS token_usage_sessions_status_idx ON public.token_usage_sessions(status);

-- Function to initialize user tokens (10,000 free tokens)
CREATE OR REPLACE FUNCTION initialize_user_tokens(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert initial token balance
  INSERT INTO public.user_tokens (user_id, balance, total_purchased, total_consumed)
  VALUES (user_id_param, 10000, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Record the bonus transaction
  INSERT INTO public.token_transactions (user_id, type, amount, balance_after, description, metadata)
  SELECT user_id_param, 'bonus', 10000, 10000, 'Welcome bonus - 10,000 free tokens', '{"source": "signup_bonus"}'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.token_transactions 
    WHERE user_id = user_id_param AND type = 'bonus' AND description LIKE '%Welcome bonus%'
  );
END;
$$;

-- Function to safely deduct tokens
CREATE OR REPLACE FUNCTION deduct_tokens(
  user_id_param uuid,
  amount_param bigint,
  description_param text,
  metadata_param jsonb DEFAULT '{}'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance bigint;
  new_balance bigint;
BEGIN
  -- Lock the user's token record for update
  SELECT balance INTO current_balance
  FROM public.user_tokens
  WHERE user_id = user_id_param
  FOR UPDATE;
  
  -- Check if user has enough tokens
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User token account not found';
  END IF;
  
  IF current_balance < amount_param THEN
    RETURN false; -- Insufficient tokens
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - amount_param;
  
  -- Update user balance and total consumed
  UPDATE public.user_tokens
  SET 
    balance = new_balance,
    total_consumed = total_consumed + amount_param,
    updated_at = now()
  WHERE user_id = user_id_param;
  
  -- Record the transaction
  INSERT INTO public.token_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (user_id_param, 'consumption', -amount_param, new_balance, description_param, metadata_param);
  
  RETURN true;
END;
$$;

-- Function to add tokens (from purchases)
CREATE OR REPLACE FUNCTION add_tokens(
  user_id_param uuid,
  amount_param bigint,
  description_param text,
  metadata_param jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance bigint;
BEGIN
  -- Update user balance and total purchased
  UPDATE public.user_tokens
  SET 
    balance = balance + amount_param,
    total_purchased = total_purchased + amount_param,
    updated_at = now()
  WHERE user_id = user_id_param
  RETURNING balance INTO new_balance;
  
  -- If user doesn't exist, create account first
  IF new_balance IS NULL THEN
    PERFORM public.initialize_user_tokens(user_id_param);
    
    UPDATE public.user_tokens
    SET 
      balance = balance + amount_param,
      total_purchased = total_purchased + amount_param,
      updated_at = now()
    WHERE user_id = user_id_param
    RETURNING balance INTO new_balance;
  END IF;
  
  -- Record the transaction
  INSERT INTO public.token_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (user_id_param, 'purchase', amount_param, new_balance, description_param, metadata_param);
END;
$$;

-- Function to start a usage session
CREATE OR REPLACE FUNCTION start_usage_session(
  user_id_param uuid,
  service_type_param token_service_type,
  session_id_param text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_uuid uuid;
BEGIN
  INSERT INTO public.token_usage_sessions (user_id, service_type, session_id, status)
  VALUES (user_id_param, service_type_param, session_id_param, 'active')
  RETURNING id INTO session_uuid;
  
  RETURN session_uuid;
END;
$$;

-- Function to end a usage session and deduct tokens
CREATE OR REPLACE FUNCTION end_usage_session(
  session_id_param text,
  duration_seconds_param integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record record;
  tokens_to_deduct bigint;
  deduction_success boolean;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.token_usage_sessions
  WHERE session_id = session_id_param AND status = 'active'
  FOR UPDATE;
  
  IF session_record IS NULL THEN
    RAISE EXCEPTION 'Active session not found';
  END IF;
  
  -- Calculate tokens based on service type and duration
  CASE session_record.service_type
    WHEN 'conversational_ai' THEN
      tokens_to_deduct := duration_seconds_param; -- 1 token per second
    WHEN 'pica_endpoint' THEN
      tokens_to_deduct := CEIL(duration_seconds_param * 0.5); -- 0.5 tokens per second
    ELSE
      RAISE EXCEPTION 'Unknown service type';
  END CASE;
  
  -- Deduct tokens
  SELECT public.deduct_tokens(
    session_record.user_id,
    tokens_to_deduct,
    'Usage: ' || session_record.service_type || ' for ' || duration_seconds_param || ' seconds',
    jsonb_build_object(
      'session_id', session_id_param,
      'service_type', session_record.service_type,
      'duration_seconds', duration_seconds_param
    )
  ) INTO deduction_success;
  
  -- Update session record
  UPDATE public.token_usage_sessions
  SET 
    end_time = now(),
    duration_seconds = duration_seconds_param,
    tokens_consumed = tokens_to_deduct,
    status = CASE WHEN deduction_success THEN 'completed' ELSE 'cancelled' END,
    updated_at = now()
  WHERE id = session_record.id;
  
  RETURN deduction_success;
END;
$$;

-- Trigger to auto-initialize tokens for new users
CREATE OR REPLACE FUNCTION trigger_initialize_user_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.initialize_user_tokens(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_initialize_user_tokens();

-- Update function for user_tokens updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_tokens_updated_at
  BEFORE UPDATE ON public.user_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_usage_sessions_updated_at
  BEFORE UPDATE ON public.token_usage_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();