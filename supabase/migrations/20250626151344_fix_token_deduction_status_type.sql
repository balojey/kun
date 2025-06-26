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
    status = CASE WHEN deduction_success THEN 'completed'::token_session_status ELSE 'cancelled'::token_session_status END,
    updated_at = now()
  WHERE id = session_record.id;
  
  RETURN deduction_success;
END;
$$;