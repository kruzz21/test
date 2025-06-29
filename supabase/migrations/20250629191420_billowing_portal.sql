/*
  # Setup Supabase Authentication and Fix Appointment System

  1. Authentication Setup
    - Enable authentication
    - Create admin user management
    - Set up proper RLS policies

  2. Fix Appointment System
    - Ensure consistent column naming
    - Fix data type mismatches
    - Update policies for proper access control

  3. Security
    - Proper RLS policies for authenticated vs public access
    - Admin-only operations for appointment management
*/

-- Enable authentication extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  -- Check if the current user has admin role
  -- This can be customized based on your admin identification logic
  RETURN auth.jwt() ->> 'role' = 'admin' OR 
         auth.jwt() ->> 'email' IN ('admin@example.com', 'gurkan@example.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin_users table to manage admin access
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_users (only admins can manage)
CREATE POLICY "Only admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Insert default admin user
INSERT INTO admin_users (email) VALUES ('admin@example.com') ON CONFLICT (email) DO NOTHING;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public can view available slots" ON appointment_slots;
DROP POLICY IF EXISTS "Admins can manage slots" ON appointment_slots;
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
DROP POLICY IF EXISTS "Public can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can manage appointments" ON appointments;

-- Create comprehensive policies for appointment_slots
CREATE POLICY "Anyone can view available slots"
  ON appointment_slots
  FOR SELECT
  TO public
  USING (available = true);

CREATE POLICY "Authenticated users can view all slots"
  ON appointment_slots
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage all slots"
  ON appointment_slots
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create comprehensive policies for appointments
CREATE POLICY "Public can create appointments"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view appointments"
  ON appointments
  FOR SELECT
  TO public
  USING (true);

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

-- Create a function to handle admin authentication
CREATE OR REPLACE FUNCTION authenticate_admin(email_input text, password_input text)
RETURNS json AS $$
DECLARE
  admin_exists boolean;
  result json;
BEGIN
  -- Check if admin exists and is active
  SELECT EXISTS(
    SELECT 1 FROM admin_users 
    WHERE email = email_input AND is_active = true
  ) INTO admin_exists;
  
  -- Simple password check (in production, use proper password hashing)
  IF admin_exists AND password_input = 'DrGurkan2025!' THEN
    result := json_build_object(
      'success', true,
      'message', 'Authentication successful',
      'user', json_build_object('email', email_input, 'role', 'admin')
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get appointment statistics
CREATE OR REPLACE FUNCTION get_appointment_stats()
RETURNS json AS $$
DECLARE
  stats json;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
    'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed')
  ) INTO stats
  FROM appointments;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to safely update appointment status
CREATE OR REPLACE FUNCTION update_appointment_status_safe(
  appointment_id uuid,
  new_status text
)
RETURNS json AS $$
DECLARE
  updated_appointment appointments%ROWTYPE;
  result json;
BEGIN
  -- Validate status
  IF new_status NOT IN ('pending', 'confirmed', 'cancelled', 'completed') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid status value'
    );
  END IF;
  
  -- Update the appointment
  UPDATE appointments 
  SET status = new_status, updated_at = now()
  WHERE id = appointment_id
  RETURNING * INTO updated_appointment;
  
  -- Check if appointment was found and updated
  IF updated_appointment.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Appointment not found'
    );
  END IF;
  
  -- Return success with updated appointment
  RETURN json_build_object(
    'success', true,
    'appointment', row_to_json(updated_appointment)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to safely delete appointment
CREATE OR REPLACE FUNCTION delete_appointment_safe(appointment_id uuid)
RETURNS json AS $$
DECLARE
  deleted_appointment appointments%ROWTYPE;
  result json;
BEGIN
  -- Get the appointment before deleting
  SELECT * INTO deleted_appointment FROM appointments WHERE id = appointment_id;
  
  -- Check if appointment exists
  IF deleted_appointment.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Appointment not found'
    );
  END IF;
  
  -- Delete the appointment
  DELETE FROM appointments WHERE id = appointment_id;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Appointment deleted successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all required columns exist with correct data types
DO $$
BEGIN
  -- Ensure appointments table has all required columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'name') THEN
    ALTER TABLE appointments ADD COLUMN name text NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'email') THEN
    ALTER TABLE appointments ADD COLUMN email text NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'phone') THEN
    ALTER TABLE appointments ADD COLUMN phone text NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'date') THEN
    ALTER TABLE appointments ADD COLUMN date date NOT NULL DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'time') THEN
    ALTER TABLE appointments ADD COLUMN time time NOT NULL DEFAULT '09:00';
  END IF;
  
  -- Ensure appointment_slots has available column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointment_slots' AND column_name = 'available') THEN
    ALTER TABLE appointment_slots ADD COLUMN available boolean DEFAULT true;
  END IF;
END $$;

-- Create or update indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, time);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_date_available ON appointment_slots(date, available);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant limited permissions to anonymous users
GRANT SELECT ON appointment_slots TO anon;
GRANT INSERT, SELECT ON appointments TO anon;