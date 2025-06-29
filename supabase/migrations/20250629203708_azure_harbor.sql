/*
  # Fix Authentication Functions Migration

  1. Drop existing functions to avoid parameter name conflicts
  2. Create log_audit_event function for audit logging
  3. Create is_admin function for admin checks
  4. Create authenticate_admin_secure function for admin authentication
  5. Grant proper permissions

  This migration fixes the authentication system by ensuring all required
  functions exist with the correct signatures.
*/

-- Drop existing functions if they exist to avoid parameter name conflicts
DROP FUNCTION IF EXISTS log_audit_event(text, text, text, jsonb, inet, text, boolean);
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS authenticate_admin_secure(text, text);

-- Create function to log audit events
CREATE FUNCTION log_audit_event(
  p_user_email text,
  p_action text,
  p_resource text,
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
END;
$$;

-- Create function to check if user is admin
CREATE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email text;
BEGIN
  -- Get the admin email from the current session context
  admin_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  IF admin_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if the email exists in admin_users and is active
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = admin_email AND is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Create secure admin authentication function
CREATE FUNCTION authenticate_admin_secure(
  email_input text,
  password_input text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  auth_result jsonb;
  client_ip inet;
  client_user_agent text;
BEGIN
  -- Get client IP and user agent from headers if available
  BEGIN
    client_ip := (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet;
  EXCEPTION
    WHEN OTHERS THEN
      client_ip := NULL;
  END;
  
  BEGIN
    client_user_agent := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION
    WHEN OTHERS THEN
      client_user_agent := NULL;
  END;

  -- Validate input
  IF email_input IS NULL OR password_input IS NULL THEN
    PERFORM log_audit_event(
      email_input,
      'admin_login_attempt',
      'admin_authentication',
      jsonb_build_object('reason', 'missing_credentials'),
      client_ip,
      client_user_agent,
      false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Email and password are required'
    );
  END IF;

  -- Find admin user
  SELECT * INTO admin_record
  FROM admin_users
  WHERE email = email_input AND is_active = true;

  -- Check if admin exists
  IF NOT FOUND THEN
    -- Log failed login attempt
    INSERT INTO failed_login_attempts (email, ip_address, user_agent)
    VALUES (email_input, client_ip, client_user_agent);
    
    PERFORM log_audit_event(
      email_input,
      'admin_login_attempt',
      'admin_authentication',
      jsonb_build_object('reason', 'user_not_found'),
      client_ip,
      client_user_agent,
      false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;

  -- Verify password (assuming bcrypt hashing)
  IF admin_record.hashed_password IS NULL OR 
     NOT crypt(password_input, admin_record.hashed_password) = admin_record.hashed_password THEN
    
    -- Log failed login attempt
    INSERT INTO failed_login_attempts (email, ip_address, user_agent)
    VALUES (email_input, client_ip, client_user_agent);
    
    PERFORM log_audit_event(
      email_input,
      'admin_login_attempt',
      'admin_authentication',
      jsonb_build_object('reason', 'invalid_password'),
      client_ip,
      client_user_agent,
      false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;

  -- Successful authentication
  PERFORM log_audit_event(
    email_input,
    'admin_login_success',
    'admin_authentication',
    jsonb_build_object('admin_id', admin_record.id),
    client_ip,
    client_user_agent,
    true
  );

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Authentication successful',
    'user', jsonb_build_object(
      'email', admin_record.email,
      'role', 'admin'
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log unexpected error
    PERFORM log_audit_event(
      email_input,
      'admin_login_error',
      'admin_authentication',
      jsonb_build_object('error', SQLERRM),
      client_ip,
      client_user_agent,
      false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Authentication failed due to system error'
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin TO authenticated, anon;
GRANT EXECUTE ON FUNCTION authenticate_admin_secure TO authenticated, anon;