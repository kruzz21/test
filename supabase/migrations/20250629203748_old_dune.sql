/*
  # Fix Authentication Functions Migration

  1. Functions
    - Update log_audit_event function with correct parameter names
    - Keep is_admin function (used by RLS policies)
    - Create authenticate_admin_secure function for frontend authentication

  2. Security
    - Proper audit logging for all authentication attempts
    - Secure password verification using bcrypt
    - Failed login attempt tracking

  3. Permissions
    - Grant execute permissions to authenticated and anonymous users
*/

-- Only drop functions that don't have dependencies
DROP FUNCTION IF EXISTS log_audit_event(text, text, text, jsonb, inet, text, boolean);
DROP FUNCTION IF EXISTS authenticate_admin_secure(text, text);

-- Create or replace the audit logging function with correct parameter names
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
    -- Silently handle errors to prevent breaking calling functions
    NULL;
END;
$$;

-- Keep the existing is_admin function (used by RLS policies) but ensure it's properly defined
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email text;
BEGIN
  -- Get the admin email from the current session context
  BEGIN
    admin_email := current_setting('request.headers', true)::json->>'x-admin-email';
  EXCEPTION
    WHEN OTHERS THEN
      admin_email := NULL;
  END;
  
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

-- Create the authenticate_admin_secure function that the frontend is calling
CREATE FUNCTION authenticate_admin_secure(
  email_input text,
  password_input text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
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
  IF email_input IS NULL OR password_input IS NULL OR 
     trim(email_input) = '' OR trim(password_input) = '' THEN
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

  -- Check if password is set
  IF admin_record.hashed_password IS NULL THEN
    PERFORM log_audit_event(
      email_input,
      'admin_login_attempt',
      'admin_authentication',
      jsonb_build_object('reason', 'password_not_set'),
      client_ip,
      client_user_agent,
      false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Password not set for this admin user'
    );
  END IF;

  -- Verify password using bcrypt
  IF NOT crypt(password_input, admin_record.hashed_password) = admin_record.hashed_password THEN
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
GRANT EXECUTE ON FUNCTION log_audit_event(text, text, text, jsonb, inet, text, boolean) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION authenticate_admin_secure(text, text) TO authenticated, anon;