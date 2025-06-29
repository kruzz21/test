/*
  # Create Authentication and Security Functions

  1. New Functions
    - `log_audit_event` - Logs security and audit events
    - `authenticate_admin_secure` - Secure admin authentication with logging
    - `create_admin_user` - Creates new admin users
    - `set_admin_password` - Sets admin password (for initial setup)
    - `change_admin_password` - Changes admin password with verification
    - `verify_admin_password` - Verifies admin password
    - `is_admin` - Helper function to check if current user is admin
    - `hash_password` - Secure password hashing function
    - `verify_password` - Password verification function

  2. Security Features
    - Secure password hashing using pgcrypto
    - Failed login attempt tracking
    - Audit logging for all authentication events
    - Rate limiting support through failed attempts tracking

  3. Notes
    - All functions include proper error handling
    - Audit logs are created for all authentication attempts
    - Passwords are hashed using bcrypt via pgcrypto extension
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS authenticate_admin_secure(text, text);
DROP FUNCTION IF EXISTS authenticate_admin_secure(text, text, inet, text);
DROP FUNCTION IF EXISTS authenticate_admin(text, text);
DROP FUNCTION IF EXISTS hash_password(text);
DROP FUNCTION IF EXISTS verify_password(text, text);
DROP FUNCTION IF EXISTS log_audit_event(text, text, text, jsonb, inet, text, boolean);
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS record_failed_login(text, inet, text);
DROP FUNCTION IF EXISTS is_account_locked(text);
DROP FUNCTION IF EXISTS create_admin_user(text, text);
DROP FUNCTION IF EXISTS set_admin_password(text, text);
DROP FUNCTION IF EXISTS change_admin_password(text, text, text);
DROP FUNCTION IF EXISTS verify_admin_password(text, text);

-- Helper function to hash passwords securely
CREATE FUNCTION hash_password(password_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(password_input, gen_salt('bf', 12));
END;
$$;

-- Helper function to verify passwords
CREATE FUNCTION verify_password(password_input text, hashed_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(password_input, hashed_password) = hashed_password;
END;
$$;

-- Function to log audit events
CREATE FUNCTION log_audit_event(
  user_email_input text DEFAULT NULL,
  action_input text DEFAULT NULL,
  resource_input text DEFAULT NULL,
  details_input jsonb DEFAULT NULL,
  ip_address_input inet DEFAULT NULL,
  user_agent_input text DEFAULT NULL,
  success_input boolean DEFAULT true
)
RETURNS void
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
END;
$$;

-- Function to check if current user is admin
CREATE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email text;
BEGIN
  -- Get admin email from request headers (set by authenticated client)
  admin_email := current_setting('request.headers', true)::json->>'x-admin-email';
  
  IF admin_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if admin exists and is active
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = admin_email AND is_active = true
  );
END;
$$;

-- Function to record failed login attempts
CREATE FUNCTION record_failed_login(
  email_input text,
  ip_address_input inet DEFAULT NULL,
  user_agent_input text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO failed_login_attempts (
    email,
    ip_address,
    user_agent,
    attempt_time
  ) VALUES (
    email_input,
    ip_address_input,
    user_agent_input,
    now()
  );
END;
$$;

-- Function to check if account is locked due to failed attempts
CREATE FUNCTION is_account_locked(email_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  failed_count integer;
  lockout_time interval := '15 minutes';
BEGIN
  -- Count failed attempts in the last 15 minutes
  SELECT COUNT(*)
  INTO failed_count
  FROM failed_login_attempts
  WHERE email = email_input
    AND attempt_time > (now() - lockout_time);
  
  -- Lock account if 5 or more failed attempts
  RETURN failed_count >= 5;
END;
$$;

-- Main authentication function
CREATE FUNCTION authenticate_admin_secure(
  email_input text,
  password_input text,
  ip_address_input inet DEFAULT NULL,
  user_agent_input text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  auth_result json;
  is_locked boolean;
BEGIN
  -- Check if account is locked
  SELECT is_account_locked(email_input) INTO is_locked;
  
  IF is_locked THEN
    -- Log failed attempt
    PERFORM log_audit_event(
      email_input,
      'admin_login_attempt',
      'admin_authentication',
      json_build_object('reason', 'account_locked', 'email', email_input),
      ip_address_input,
      user_agent_input,
      false
    );
    
    RETURN json_build_object(
      'success', false,
      'message', 'Account temporarily locked due to multiple failed attempts. Please try again later.'
    );
  END IF;
  
  -- Get admin user
  SELECT * INTO admin_record
  FROM admin_users
  WHERE email = email_input AND is_active = true;
  
  -- Check if admin exists
  IF NOT FOUND THEN
    -- Record failed attempt
    PERFORM record_failed_login(email_input, ip_address_input, user_agent_input);
    
    -- Log failed attempt
    PERFORM log_audit_event(
      email_input,
      'admin_login_attempt',
      'admin_authentication',
      json_build_object('reason', 'user_not_found', 'email', email_input),
      ip_address_input,
      user_agent_input,
      false
    );
    
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Check if password is set
  IF admin_record.hashed_password IS NULL THEN
    -- Log failed attempt
    PERFORM log_audit_event(
      email_input,
      'admin_login_attempt',
      'admin_authentication',
      json_build_object('reason', 'password_not_set', 'email', email_input),
      ip_address_input,
      user_agent_input,
      false
    );
    
    RETURN json_build_object(
      'success', false,
      'message', 'Password not set. Please contact administrator.'
    );
  END IF;
  
  -- Verify password
  IF NOT verify_password(password_input, admin_record.hashed_password) THEN
    -- Record failed attempt
    PERFORM record_failed_login(email_input, ip_address_input, user_agent_input);
    
    -- Log failed attempt
    PERFORM log_audit_event(
      email_input,
      'admin_login_attempt',
      'admin_authentication',
      json_build_object('reason', 'invalid_password', 'email', email_input),
      ip_address_input,
      user_agent_input,
      false
    );
    
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Successful authentication
  -- Log successful login
  PERFORM log_audit_event(
    email_input,
    'admin_login_success',
    'admin_authentication',
    json_build_object('admin_id', admin_record.id, 'email', email_input),
    ip_address_input,
    user_agent_input,
    true
  );
  
  -- Return success with user data
  RETURN json_build_object(
    'success', true,
    'message', 'Authentication successful',
    'user', json_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'role', 'admin'
    )
  );
END;
$$;

-- Function to create admin user
CREATE FUNCTION create_admin_user(
  email_input text,
  password_input text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_admin_id uuid;
  hashed_pwd text;
BEGIN
  -- Validate email format
  IF email_input !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid email format'
    );
  END IF;
  
  -- Check if admin already exists
  IF EXISTS (SELECT 1 FROM admin_users WHERE email = email_input) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Admin user already exists'
    );
  END IF;
  
  -- Hash password
  hashed_pwd := hash_password(password_input);
  
  -- Create admin user
  INSERT INTO admin_users (email, hashed_password, is_active, created_at)
  VALUES (email_input, hashed_pwd, true, now())
  RETURNING id INTO new_admin_id;
  
  -- Log admin creation
  PERFORM log_audit_event(
    email_input,
    'admin_user_created',
    'admin_management',
    json_build_object('admin_id', new_admin_id, 'email', email_input),
    NULL,
    NULL,
    true
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Admin user created successfully'
  );
END;
$$;

-- Function to set admin password (for initial setup)
CREATE FUNCTION set_admin_password(
  email_input text,
  new_password_input text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  hashed_pwd text;
BEGIN
  -- Get admin user
  SELECT * INTO admin_record
  FROM admin_users
  WHERE email = email_input AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Admin user not found'
    );
  END IF;
  
  -- Hash new password
  hashed_pwd := hash_password(new_password_input);
  
  -- Update password
  UPDATE admin_users
  SET hashed_password = hashed_pwd
  WHERE id = admin_record.id;
  
  -- Log password change
  PERFORM log_audit_event(
    email_input,
    'admin_password_set',
    'admin_management',
    json_build_object('admin_id', admin_record.id, 'email', email_input),
    NULL,
    NULL,
    true
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password set successfully'
  );
END;
$$;

-- Function to change admin password with current password verification
CREATE FUNCTION change_admin_password(
  email_input text,
  current_password text,
  new_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  hashed_pwd text;
BEGIN
  -- Get admin user
  SELECT * INTO admin_record
  FROM admin_users
  WHERE email = email_input AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Admin user not found'
    );
  END IF;
  
  -- Verify current password
  IF admin_record.hashed_password IS NULL OR 
     NOT verify_password(current_password, admin_record.hashed_password) THEN
    -- Log failed attempt
    PERFORM log_audit_event(
      email_input,
      'admin_password_change_failed',
      'admin_management',
      json_build_object('reason', 'invalid_current_password', 'admin_id', admin_record.id),
      NULL,
      NULL,
      false
    );
    
    RETURN json_build_object(
      'success', false,
      'message', 'Current password is incorrect'
    );
  END IF;
  
  -- Hash new password
  hashed_pwd := hash_password(new_password);
  
  -- Update password
  UPDATE admin_users
  SET hashed_password = hashed_pwd
  WHERE id = admin_record.id;
  
  -- Log successful password change
  PERFORM log_audit_event(
    email_input,
    'admin_password_changed',
    'admin_management',
    json_build_object('admin_id', admin_record.id, 'email', email_input),
    NULL,
    NULL,
    true
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password changed successfully'
  );
END;
$$;

-- Function to verify admin password
CREATE FUNCTION verify_admin_password(
  email_input text,
  password_input text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
BEGIN
  -- Get admin user
  SELECT * INTO admin_record
  FROM admin_users
  WHERE email = email_input AND is_active = true;
  
  IF NOT FOUND OR admin_record.hashed_password IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verify password
  RETURN verify_password(password_input, admin_record.hashed_password);
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated, anon;
GRANT EXECUTE ON FUNCTION authenticate_admin_secure TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_admin_user TO authenticated, anon;
GRANT EXECUTE ON FUNCTION set_admin_password TO authenticated, anon;
GRANT EXECUTE ON FUNCTION change_admin_password TO authenticated, anon;
GRANT EXECUTE ON FUNCTION verify_admin_password TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin TO authenticated, anon;
GRANT EXECUTE ON FUNCTION hash_password TO authenticated, anon;
GRANT EXECUTE ON FUNCTION verify_password TO authenticated, anon;
GRANT EXECUTE ON FUNCTION record_failed_login TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_account_locked TO authenticated, anon;