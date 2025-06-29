/*
  # Add Password Hashing for Admin Users

  1. Database Changes
    - Enable pgcrypto extension for password hashing
    - Add hashed_password column to admin_users table
    - Create functions for password management
    - Update authentication function to use hashed passwords

  2. Security Features
    - Use bcrypt for password hashing
    - Secure password verification
    - Admin password management functions

  3. Functions
    - authenticate_admin_secure: Secure authentication with hashed passwords
    - set_admin_password: Set/update admin passwords with hashing
    - create_admin_user: Create new admin users with hashed passwords
*/

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add hashed_password column to admin_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'hashed_password'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN hashed_password text;
  END IF;
END $$;

-- Create function to set admin password with hashing
CREATE OR REPLACE FUNCTION set_admin_password(
  email_input text,
  new_password_input text
)
RETURNS json AS $$
DECLARE
  admin_exists boolean;
  salt text;
  hashed_password text;
  result json;
BEGIN
  -- Check if admin exists
  SELECT EXISTS(
    SELECT 1 FROM admin_users 
    WHERE email = email_input
  ) INTO admin_exists;
  
  IF NOT admin_exists THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Admin user not found'
    );
  END IF;
  
  -- Validate password strength (minimum 8 characters)
  IF length(new_password_input) < 8 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Password must be at least 8 characters long'
    );
  END IF;
  
  -- Generate salt and hash password using bcrypt
  salt := gen_salt('bf', 12);
  hashed_password := crypt(new_password_input, salt);
  
  -- Update the admin user's password
  UPDATE admin_users 
  SET hashed_password = hashed_password
  WHERE email = email_input;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password updated successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create new admin user with hashed password
CREATE OR REPLACE FUNCTION create_admin_user(
  email_input text,
  password_input text
)
RETURNS json AS $$
DECLARE
  admin_exists boolean;
  salt text;
  hashed_password text;
  new_admin_id uuid;
  result json;
BEGIN
  -- Check if admin already exists
  SELECT EXISTS(
    SELECT 1 FROM admin_users 
    WHERE email = email_input
  ) INTO admin_exists;
  
  IF admin_exists THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Admin user already exists'
    );
  END IF;
  
  -- Validate email format
  IF email_input !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid email format'
    );
  END IF;
  
  -- Validate password strength
  IF length(password_input) < 8 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Password must be at least 8 characters long'
    );
  END IF;
  
  -- Generate salt and hash password using bcrypt
  salt := gen_salt('bf', 12);
  hashed_password := crypt(password_input, salt);
  
  -- Insert new admin user
  INSERT INTO admin_users (email, hashed_password, is_active)
  VALUES (email_input, hashed_password, true)
  RETURNING id INTO new_admin_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Admin user created successfully',
    'admin_id', new_admin_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update authenticate_admin function to use hashed passwords
CREATE OR REPLACE FUNCTION authenticate_admin_secure(
  email_input text, 
  password_input text
)
RETURNS json AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  password_valid boolean;
  result json;
BEGIN
  -- Get admin user record
  SELECT * INTO admin_record
  FROM admin_users 
  WHERE email = email_input AND is_active = true;
  
  -- Check if admin exists
  IF admin_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Check if password is set
  IF admin_record.hashed_password IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Password not set for this admin user'
    );
  END IF;
  
  -- Verify password using bcrypt
  password_valid := (admin_record.hashed_password = crypt(password_input, admin_record.hashed_password));
  
  IF password_valid THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Authentication successful',
      'user', json_build_object(
        'id', admin_record.id,
        'email', admin_record.email,
        'role', 'admin'
      )
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify current password (for password changes)
CREATE OR REPLACE FUNCTION verify_admin_password(
  email_input text,
  password_input text
)
RETURNS boolean AS $$
DECLARE
  stored_hash text;
BEGIN
  -- Get stored password hash
  SELECT hashed_password INTO stored_hash
  FROM admin_users 
  WHERE email = email_input AND is_active = true;
  
  -- Return false if admin not found or no password set
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verify password
  RETURN (stored_hash = crypt(password_input, stored_hash));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to change admin password (requires current password)
CREATE OR REPLACE FUNCTION change_admin_password(
  email_input text,
  current_password text,
  new_password text
)
RETURNS json AS $$
DECLARE
  password_valid boolean;
  salt text;
  hashed_password text;
BEGIN
  -- Verify current password
  SELECT verify_admin_password(email_input, current_password) INTO password_valid;
  
  IF NOT password_valid THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Current password is incorrect'
    );
  END IF;
  
  -- Validate new password strength
  IF length(new_password) < 8 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'New password must be at least 8 characters long'
    );
  END IF;
  
  -- Generate salt and hash new password
  salt := gen_salt('bf', 12);
  hashed_password := crypt(new_password, salt);
  
  -- Update password
  UPDATE admin_users 
  SET hashed_password = hashed_password
  WHERE email = email_input AND is_active = true;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password changed successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up initial admin user with hashed password
-- This will create the default admin if it doesn't exist
DO $$
DECLARE
  admin_exists boolean;
  result json;
BEGIN
  -- Check if any admin users exist
  SELECT EXISTS(SELECT 1 FROM admin_users) INTO admin_exists;
  
  -- If no admin users exist, create the default one
  IF NOT admin_exists THEN
    SELECT create_admin_user('admin@drgeryanilmaz.com', 'DrGurkan2025!') INTO result;
    RAISE NOTICE 'Default admin user created: %', result;
  ELSE
    -- Update existing admin users to have hashed passwords if they don't already
    UPDATE admin_users 
    SET hashed_password = crypt('DrGurkan2025!', gen_salt('bf', 12))
    WHERE hashed_password IS NULL;
    RAISE NOTICE 'Updated existing admin users with hashed passwords';
  END IF;
END $$;

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION set_admin_password(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_user(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_admin_secure(text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION verify_admin_password(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION change_admin_password(text, text, text) TO authenticated;

-- Create index on email for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email_active ON admin_users(email, is_active);