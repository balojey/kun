/*
  # Update Token Pricing

  1. Updates
    - Update token deduction functions to reflect new pricing:
      - Conversational AI: 4.5 tokens per second (was 1 token)
      - Pica automation: 2 tokens per second (was 0.5 tokens)
    - Update all related functions and documentation

  2. Functions Updated
    - `check_tokens_for_execution`: Update to use 2 tokens per second for pica
    - `deduct_tokens_for_execution`: Update to use 2 tokens per second for pica
    - `deduct_tokens_for_conversation`: Update to use 4.5 tokens per second for conversations
    - `end_usage_session`: Update token calculations for both service types
*/

-- Function to check if user has sufficient tokens for execution (updated pricing)
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
  -- Calculate required tokens (2 tokens per second for pica automation)
  required_tokens := CEIL(estimated_seconds_param * 2.0);
  
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

-- Function to deduct tokens based on execution time (updated pricing)
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
  -- Calculate tokens to deduct (2 tokens per second for pica automation)
  tokens_to_deduct := CEIL(execution_seconds_param * 2.0);
  
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

-- Function to deduct tokens for conversation duration (updated pricing)
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
  -- Calculate tokens to deduct (4.5 tokens per second for conversations)
  tokens_to_deduct := CEIL(conversation_duration_param * 4.5);
  
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

-- Function to end a usage session and deduct tokens (updated pricing)
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
  
  -- Calculate tokens based on service type and duration (updated pricing)
  CASE session_record.service_type
    WHEN 'conversational_ai' THEN
      tokens_to_deduct := CEIL(duration_seconds_param * 4.5); -- 4.5 tokens per second
    WHEN 'pica_endpoint' THEN
      tokens_to_deduct := CEIL(duration_seconds_param * 2.0); -- 2 tokens per second
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
    status = CASE WHEN deduction_success THEN 'completed'::token_session_status ELSE 'cancelled'::token_session_status END,
    updated_at = now()
  WHERE id = session_record.id;
  
  RETURN deduction_success;
END;
$$;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION check_tokens_for_execution(text, float) TO service_role;
GRANT EXECUTE ON FUNCTION deduct_tokens_for_execution(text, float, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION deduct_tokens_for_conversation(text, float, text) TO service_role;
GRANT EXECUTE ON FUNCTION end_usage_session(text, integer) TO service_role;