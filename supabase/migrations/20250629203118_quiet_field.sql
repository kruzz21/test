/*
  # Add missing log_audit_event function

  1. New Functions
    - `log_audit_event` - Function to log audit events to the audit_logs table
      - Parameters: user_email (text), action (text), resource (text), details (json), ip_address (inet), user_agent (text), success (boolean)
      - Returns: void
      - Inserts audit log entries with proper error handling

  2. Security
    - Function is marked as SECURITY DEFINER to allow proper logging
    - Only accessible to authenticated users through RPC calls
*/

-- Create the log_audit_event function
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_email text,
  p_action text,
  p_resource text DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_success boolean DEFAULT true
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
    p_user_email,
    p_action,
    p_resource,
    p_details,
    p_ip_address,
    p_user_agent,
    p_success,
    now()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the calling function
    RAISE WARNING 'Failed to log audit event: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_audit_event(text, text, text, jsonb, inet, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_event(text, text, text, jsonb, inet, text, boolean) TO service_role;