/*
  # Simplified Secure Authentication System

  1. Core Tables
    - `users` - Main user table with essential fields only
    - `user_sessions` - Session management
    - `login_attempts` - Rate limiting and security monitoring

  2. Security Features
    - bcrypt password hashing (industry standard)
    - Session-based authentication with secure tokens
    - Rate limiting (5 attempts per 15 minutes)
    - Audit logging for security events
    - OWASP-compliant security practices

  3. Simplified Design
    - Single user table (no separate admin_users)
    - Role-based access via user.role field
    - Clean function signatures
    - Minimal but secure session management
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing complex authentication tables and functions
DROP POLICY IF EXISTS "Only admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage all slots" ON appointment_slots;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can delete appointments" ON appointments;

DROP FUNCTION IF EXISTS authenticate_admin_secure(text, text);
DROP FUNCTION IF EXISTS authenticate_admin_secure(text, text, inet, text);
DROP FUNCTION IF EXISTS log_audit_event(text, text, text, jsonb, inet, text, boolean);
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS create_admin_user(text, text);
DROP FUNCTION IF EXISTS set_admin_password(text, text);
DROP FUNCTION IF EXISTS hash_password(text);
DROP FUNCTION IF EXISTS verify_password(text, text);

DROP TABLE IF EXISTS admin_sessions;
DROP TABLE IF EXISTS admin_2fa_secrets;
DROP TABLE IF EXISTS failed_login_attempts;
DROP TABLE IF EXISTS admin_users;

-- Create simplified users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user sessions table for secure session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

-- Create login attempts table for rate limiting
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet,
  success boolean DEFAULT false,
  attempted_at timestamptz DEFAULT now(),
  user_agent text
);

-- Create security audit log
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text,
  action text NOT NULL,
  details jsonb,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, attempted_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_created ON security_logs(created_at);

-- Password hashing function
CREATE OR REPLACE FUNCTION hash_password(password_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use bcrypt with cost factor 12 (industry standard)
  RETURN crypt(password_text, gen_salt('bf', 12));
END;
$$;

-- Password verification function
CREATE OR REPLACE FUNCTION verify_password(password_text text, hash_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(password_text, hash_text) = hash_text;
END;
$$;

-- Security logging function
CREATE OR REPLACE FUNCTION log_security_event(
  user_email_param text,
  action_param text,
  details_param jsonb DEFAULT NULL,
  ip_address_param inet DEFAULT NULL,
  user_agent_param text DEFAULT NULL,
  success_param boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO security_logs (
    user_email, action, details, ip_address, user_agent, success
  ) VALUES (
    user_email_param, action_param, details_param, 
    ip_address_param, user_agent_param, success_param
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the calling function if logging fails
    NULL;
END;
$$;

-- Rate limiting check function
CREATE OR REPLACE FUNCTION check_rate_limit(
  email_param text,
  ip_param inet DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_attempts integer;
  ip_attempts integer;
  lockout_period interval := '15 minutes';
  max_attempts integer := 5;
BEGIN
  -- Count failed attempts for email in last 15 minutes
  SELECT COUNT(*) INTO email_attempts
  FROM login_attempts
  WHERE email = email_param
    AND success = false
    AND attempted_at > (now() - lockout_period);
  
  -- Count failed attempts for IP in last 15 minutes
  SELECT COUNT(*) INTO ip_attempts
  FROM login_attempts
  WHERE ip_address = ip_param
    AND success = false
    AND attempted_at > (now() - lockout_period);
  
  -- Return true if rate limit exceeded
  RETURN email_attempts >= max_attempts OR ip_attempts >= (max_attempts * 2);
END;
$$;

-- Record login attempt function
CREATE OR REPLACE FUNCTION record_login_attempt(
  email_param text,
  success_param boolean,
  ip_param inet DEFAULT NULL,
  user_agent_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO login_attempts (email, success, ip_address, user_agent)
  VALUES (email_param, success_param, ip_param, user_agent_param);
  
  -- Clean up old attempts (older than 24 hours)
  DELETE FROM login_attempts
  WHERE attempted_at < (now() - interval '24 hours');
END;
$$;

-- Create session function
CREATE OR REPLACE FUNCTION create_user_session(
  user_id_param uuid,
  ip_param inet DEFAULT NULL,
  user_agent_param text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_token_val text;
  expires_at_val timestamptz;
BEGIN
  -- Generate secure session token
  session_token_val := encode(gen_random_bytes(32), 'base64');
  expires_at_val := now() + interval '8 hours';
  
  -- Clean up expired sessions for this user
  DELETE FROM user_sessions
  WHERE user_id = user_id_param AND expires_at < now();
  
  -- Create new session
  INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
  VALUES (user_id_param, session_token_val, expires_at_val, ip_param, user_agent_param);
  
  RETURN session_token_val;
END;
$$;

-- Main authentication function
CREATE OR REPLACE FUNCTION authenticate_user(
  email_param text,
  password_param text,
  ip_param inet DEFAULT NULL,
  user_agent_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record users%ROWTYPE;
  session_token_val text;
  rate_limited boolean;
BEGIN
  -- Input validation
  IF email_param IS NULL OR password_param IS NULL OR 
     trim(email_param) = '' OR trim(password_param) = '' THEN
    PERFORM log_security_event(
      email_param, 'login_attempt', 
      jsonb_build_object('reason', 'missing_credentials'),
      ip_param, user_agent_param, false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Email and password are required'
    );
  END IF;
  
  -- Check rate limiting
  SELECT check_rate_limit(email_param, ip_param) INTO rate_limited;
  
  IF rate_limited THEN
    PERFORM log_security_event(
      email_param, 'login_attempt',
      jsonb_build_object('reason', 'rate_limited'),
      ip_param, user_agent_param, false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Too many failed attempts. Please try again in 15 minutes.'
    );
  END IF;
  
  -- Find user
  SELECT * INTO user_record
  FROM users
  WHERE email = email_param AND is_active = true;
  
  -- Check if user exists
  IF NOT FOUND THEN
    PERFORM record_login_attempt(email_param, false, ip_param, user_agent_param);
    PERFORM log_security_event(
      email_param, 'login_attempt',
      jsonb_build_object('reason', 'user_not_found'),
      ip_param, user_agent_param, false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Verify password
  IF NOT verify_password(password_param, user_record.password_hash) THEN
    PERFORM record_login_attempt(email_param, false, ip_param, user_agent_param);
    PERFORM log_security_event(
      email_param, 'login_attempt',
      jsonb_build_object('reason', 'invalid_password'),
      ip_param, user_agent_param, false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Successful authentication
  PERFORM record_login_attempt(email_param, true, ip_param, user_agent_param);
  
  -- Create session
  SELECT create_user_session(user_record.id, ip_param, user_agent_param) INTO session_token_val;
  
  -- Log successful login
  PERFORM log_security_event(
    email_param, 'login_success',
    jsonb_build_object('user_id', user_record.id, 'role', user_record.role),
    ip_param, user_agent_param, true
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Authentication successful',
    'user', jsonb_build_object(
      'id', user_record.id,
      'email', user_record.email,
      'role', user_record.role
    ),
    'session_token', session_token_val
  );
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM log_security_event(
      email_param, 'login_error',
      jsonb_build_object('error', SQLERRM),
      ip_param, user_agent_param, false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Authentication failed'
    );
END;
$$;

-- Validate session function
CREATE OR REPLACE FUNCTION validate_session(session_token_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record user_sessions%ROWTYPE;
  user_record users%ROWTYPE;
BEGIN
  -- Find active session
  SELECT * INTO session_record
  FROM user_sessions
  WHERE session_token = session_token_param
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Invalid or expired session'
    );
  END IF;
  
  -- Get user details
  SELECT * INTO user_record
  FROM users
  WHERE id = session_record.user_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'User not found or inactive'
    );
  END IF;
  
  -- Update last activity
  UPDATE user_sessions
  SET last_activity = now()
  WHERE id = session_record.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'user', jsonb_build_object(
      'id', user_record.id,
      'email', user_record.email,
      'role', user_record.role
    )
  );
END;
$$;

-- Create user function
CREATE OR REPLACE FUNCTION create_user(
  email_param text,
  password_param text,
  role_param text DEFAULT 'user'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  password_hash_val text;
BEGIN
  -- Validate input
  IF email_param IS NULL OR password_param IS NULL OR
     trim(email_param) = '' OR trim(password_param) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Email and password are required'
    );
  END IF;
  
  -- Validate email format
  IF email_param !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid email format'
    );
  END IF;
  
  -- Validate password strength (minimum 8 characters)
  IF length(password_param) < 8 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Password must be at least 8 characters long'
    );
  END IF;
  
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM users WHERE email = email_param) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User already exists'
    );
  END IF;
  
  -- Hash password
  password_hash_val := hash_password(password_param);
  
  -- Create user
  INSERT INTO users (email, password_hash, role)
  VALUES (email_param, password_hash_val, role_param)
  RETURNING id INTO new_user_id;
  
  -- Log user creation
  PERFORM log_security_event(
    email_param, 'user_created',
    jsonb_build_object('user_id', new_user_id, 'role', role_param),
    NULL, NULL, true
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User created successfully',
    'user_id', new_user_id
  );
END;
$$;

-- Logout function
CREATE OR REPLACE FUNCTION logout_user(session_token_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the session
  DELETE FROM user_sessions
  WHERE session_token = session_token_param;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Logged out successfully'
  );
END;
$$;

-- Check if user is admin function (for RLS policies)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_token_val text;
  user_role_val text;
BEGIN
  -- Get session token from request headers
  BEGIN
    session_token_val := current_setting('request.headers', true)::json->>'authorization';
    -- Remove 'Bearer ' prefix if present
    session_token_val := replace(session_token_val, 'Bearer ', '');
  EXCEPTION
    WHEN OTHERS THEN
      RETURN false;
  END;
  
  IF session_token_val IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user role from valid session
  SELECT u.role INTO user_role_val
  FROM user_sessions s
  JOIN users u ON s.user_id = u.id
  WHERE s.session_token = session_token_val
    AND s.expires_at > now()
    AND u.is_active = true;
  
  RETURN user_role_val = 'admin';
END;
$$;

-- Create RLS policies
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = (
    SELECT s.user_id
    FROM user_sessions s
    WHERE s.session_token = current_setting('request.headers', true)::json->>'authorization'
      AND s.expires_at > now()
  ));

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = (
    SELECT s.user_id
    FROM user_sessions s
    WHERE s.session_token = current_setting('request.headers', true)::json->>'authorization'
      AND s.expires_at > now()
  ));

CREATE POLICY "Admins can view security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Recreate appointment policies with new is_admin function
CREATE POLICY "Admins can manage all slots"
  ON appointment_slots
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can view all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Create default admin user
DO $$
DECLARE
  result jsonb;
BEGIN
  -- Create default admin if no users exist
  IF NOT EXISTS (SELECT 1 FROM users) THEN
    SELECT create_user('admin@drgeryanilmaz.com', 'DrGurkan2025!', 'admin') INTO result;
    RAISE NOTICE 'Default admin user created: %', result;
  END IF;
END $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION hash_password(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION verify_password(text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION log_security_event(text, text, jsonb, inet, text, boolean) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_rate_limit(text, inet) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION record_login_attempt(text, boolean, inet, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_user_session(uuid, inet, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION authenticate_user(text, text, inet, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION validate_session(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_user(text, text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION logout_user(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- Clean up old data periodically
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove expired sessions
  DELETE FROM user_sessions WHERE expires_at < now();
  
  -- Remove old login attempts (older than 7 days)
  DELETE FROM login_attempts WHERE attempted_at < (now() - interval '7 days');
  
  -- Remove old security logs (older than 90 days)
  DELETE FROM security_logs WHERE created_at < (now() - interval '90 days');
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_old_data() TO authenticated;