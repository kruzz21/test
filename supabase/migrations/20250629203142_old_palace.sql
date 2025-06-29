/*
  # Add missing log_audit_event function

  1. Function Creation
    - Drop existing log_audit_event function if it exists
    - Create log_audit_event function with correct parameter names
    - Add proper error handling for audit logging
    - Set appropriate security permissions

  2. Security
    - Grant execute permissions to authenticated and service_role users
    - Use SECURITY DEFINER for proper audit logging access
*/

-- Drop existing function if it exists to avoid parameter name conflicts
DROP FUNCTION IF EXISTS log_audit_event(text, text, text, jsonb, inet, text, boolean);

-- Create the log_audit_event function with correct parameter names
CREATE FUNCTION log_audit_event(
  user_email_input text,
  action_input text,
  resource_input text DEFAULT NULL,
  details_input jsonb DEFAULT NULL,
  ip_address_input inet DEFAULT NULL,
  user_agent_input text DEFAULT NULL,
  success_input boolean DEFAULT true
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_email,
    action,
    resource,
    details,
    ip_address,
    user_agent,
    success,
    created_at
  ) VALUES (
    user_email_input,
    action_input,
    resource_input,
    details_input,
    ip_address_input,
    user_agent_input,
    success_input,
    now()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the calling function
    RAISE WARNING 'Failed to log audit event: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION log_audit_event(text, text, text, jsonb, inet, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_event(text, text, text, jsonb, inet, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION log_audit_event(text, text, text, jsonb, inet, text, boolean) TO anon;