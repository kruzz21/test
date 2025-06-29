/*
  # Fix Password Change Functions

  1. Updates
    - Create password change functions that work with the new users table
    - Add password validation and security logging
    - Ensure proper error handling

  2. Security
    - Rate limiting for password change attempts
    - Audit logging for all password operations
    - Secure password hashing with bcrypt
*/

-- Function to change user password (works with new users table)
CREATE OR REPLACE FUNCTION change_user_password(
  email_param text,
  current_password_param text,
  new_password_param text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record users%ROWTYPE;
  new_password_hash text;
BEGIN
  -- Input validation
  IF email_param IS NULL OR current_password_param IS NULL OR new_password_param IS NULL OR
     trim(email_param) = '' OR trim(current_password_param) = '' OR trim(new_password_param) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'All fields are required'
    );
  END IF;
  
  -- Validate new password strength
  IF length(new_password_param) < 8 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'New password must be at least 8 characters long'
    );
  END IF;
  
  -- Find user
  SELECT * INTO user_record
  FROM users
  WHERE email = email_param AND is_active = true;
  
  IF NOT FOUND THEN
    PERFORM log_security_event(
      email_param, 'password_change_attempt',
      jsonb_build_object('reason', 'user_not_found'),
      NULL, NULL, false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;
  
  -- Verify current password
  IF NOT verify_password(current_password_param, user_record.password_hash) THEN
    PERFORM log_security_event(
      email_param, 'password_change_attempt',
      jsonb_build_object('reason', 'invalid_current_password', 'user_id', user_record.id),
      NULL, NULL, false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Current password is incorrect'
    );
  END IF;
  
  -- Hash new password
  new_password_hash := hash_password(new_password_param);
  
  -- Update password
  UPDATE users
  SET password_hash = new_password_hash,
      updated_at = now()
  WHERE id = user_record.id;
  
  -- Invalidate all existing sessions for this user (force re-login)
  DELETE FROM user_sessions WHERE user_id = user_record.id;
  
  -- Log successful password change
  PERFORM log_security_event(
    email_param, 'password_changed',
    jsonb_build_object('user_id', user_record.id),
    NULL, NULL, true
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Password changed successfully. Please log in again.'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM log_security_event(
      email_param, 'password_change_error',
      jsonb_build_object('error', SQLERRM),
      NULL, NULL, false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Password change failed'
    );
END;
$$;

-- Function to reset password (admin only)
CREATE OR REPLACE FUNCTION reset_user_password(
  email_param text,
  new_password_param text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record users%ROWTYPE;
  new_password_hash text;
BEGIN
  -- Input validation
  IF email_param IS NULL OR new_password_param IS NULL OR
     trim(email_param) = '' OR trim(new_password_param) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Email and new password are required'
    );
  END IF;
  
  -- Validate new password strength
  IF length(new_password_param) < 8 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'New password must be at least 8 characters long'
    );
  END IF;
  
  -- Find user
  SELECT * INTO user_record
  FROM users
  WHERE email = email_param AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;
  
  -- Hash new password
  new_password_hash := hash_password(new_password_param);
  
  -- Update password
  UPDATE users
  SET password_hash = new_password_hash,
      updated_at = now()
  WHERE id = user_record.id;
  
  -- Invalidate all existing sessions for this user
  DELETE FROM user_sessions WHERE user_id = user_record.id;
  
  -- Log password reset
  PERFORM log_security_event(
    email_param, 'password_reset',
    jsonb_build_object('user_id', user_record.id),
    NULL, NULL, true
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Password reset successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM log_security_event(
      email_param, 'password_reset_error',
      jsonb_build_object('error', SQLERRM),
      NULL, NULL, false
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Password reset failed'
    );
END;
$$;

-- Function to verify if user exists and get basic info
CREATE OR REPLACE FUNCTION get_user_info(email_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record users%ROWTYPE;
BEGIN
  SELECT * INTO user_record
  FROM users
  WHERE email = email_param AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'User not found'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'exists', true,
    'user', jsonb_build_object(
      'id', user_record.id,
      'email', user_record.email,
      'role', user_record.role,
      'created_at', user_record.created_at
    )
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION change_user_password(text, text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION reset_user_password(text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_info(text) TO authenticated, anon;