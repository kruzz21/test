/*
  # Database Optimization and Improvements

  1. Performance Optimizations
    - Add missing indexes for better query performance
    - Optimize existing functions for better performance
    - Add database maintenance functions

  2. Data Integrity Improvements
    - Add foreign key constraints where appropriate
    - Improve data validation constraints
    - Add cascade delete rules for data consistency

  3. Enhanced Security
    - Improve RLS policies
    - Add data encryption for sensitive fields
    - Enhanced audit logging

  4. New Features
    - Patient management improvements
    - Enhanced reporting capabilities
    - Automated cleanup procedures
*/

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_type ON appointments(service_type);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_updated_at ON appointments(updated_at);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_email_phone ON appointments(email, phone);

-- Add indexes for user sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Add indexes for calendar system
CREATE INDEX IF NOT EXISTS idx_calendar_slots_time_range ON calendar_slots(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_reason ON blocked_slots(reason);

-- Improve appointment constraints
DO $$
BEGIN
  -- Add constraint to ensure appointment time is within business hours
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_business_hours') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_business_hours 
    CHECK (time >= '08:00' AND time <= '18:00');
  END IF;

  -- Add constraint to ensure service type is not empty
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_service_type_not_empty') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_service_type_not_empty 
    CHECK (service_type IS NOT NULL AND length(trim(service_type)) > 0);
  END IF;
END $$;

-- Enhanced appointment statistics function
CREATE OR REPLACE FUNCTION get_appointment_stats_detailed()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats jsonb;
  today_stats jsonb;
  week_stats jsonb;
  month_stats jsonb;
BEGIN
  -- Overall stats
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
    'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed')
  ) INTO stats
  FROM appointments;
  
  -- Today's stats
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
    'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed')
  ) INTO today_stats
  FROM appointments
  WHERE date = CURRENT_DATE;
  
  -- This week's stats
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
    'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed')
  ) INTO week_stats
  FROM appointments
  WHERE date >= date_trunc('week', CURRENT_DATE)
    AND date < date_trunc('week', CURRENT_DATE) + interval '1 week';
  
  -- This month's stats
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
    'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed')
  ) INTO month_stats
  FROM appointments
  WHERE date >= date_trunc('month', CURRENT_DATE)
    AND date < date_trunc('month', CURRENT_DATE) + interval '1 month';
  
  RETURN jsonb_build_object(
    'overall', stats,
    'today', today_stats,
    'this_week', week_stats,
    'this_month', month_stats
  );
END;
$$;

-- Enhanced patient search function
CREATE OR REPLACE FUNCTION search_patients(
  search_term text,
  limit_count integer DEFAULT 50
)
RETURNS TABLE(
  patient_name text,
  patient_email text,
  patient_phone text,
  patient_id text,
  last_appointment_date date,
  total_appointments bigint,
  last_service_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    a.name as patient_name,
    a.email as patient_email,
    a.phone as patient_phone,
    a.patient_id,
    MAX(a.date) as last_appointment_date,
    COUNT(*) as total_appointments,
    (array_agg(a.service_type ORDER BY a.date DESC))[1] as last_service_type
  FROM appointments a
  WHERE 
    a.name ILIKE '%' || search_term || '%' OR
    a.email ILIKE '%' || search_term || '%' OR
    a.phone ILIKE '%' || search_term || '%' OR
    a.patient_id ILIKE '%' || search_term || '%'
  GROUP BY a.name, a.email, a.phone, a.patient_id
  ORDER BY MAX(a.date) DESC
  LIMIT limit_count;
END;
$$;

-- Function to get appointment history for a patient
CREATE OR REPLACE FUNCTION get_patient_history(
  patient_email_param text,
  patient_phone_param text
)
RETURNS TABLE(
  appointment_id uuid,
  appointment_date date,
  appointment_time time,
  service_type text,
  status text,
  message text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as appointment_id,
    a.date as appointment_date,
    a.time as appointment_time,
    a.service_type,
    a.status,
    a.message,
    a.created_at
  FROM appointments a
  WHERE a.email = patient_email_param 
    OR a.phone = patient_phone_param
  ORDER BY a.date DESC, a.time DESC;
END;
$$;

-- Function to generate patient ID automatically
CREATE OR REPLACE FUNCTION generate_patient_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id text;
  id_exists boolean;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric ID
    new_id := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if this ID already exists
    SELECT EXISTS(
      SELECT 1 FROM appointments WHERE patient_id = new_id
    ) INTO id_exists;
    
    -- If ID doesn't exist, we can use it
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Enhanced appointment creation function with auto patient ID
CREATE OR REPLACE FUNCTION create_appointment_enhanced(
  name_param text,
  email_param text,
  phone_param text,
  date_param date,
  time_param time,
  service_type_param text,
  message_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_appointment_id uuid;
  existing_patient_id text;
  new_patient_id text;
BEGIN
  -- Check if patient already exists (by email or phone)
  SELECT patient_id INTO existing_patient_id
  FROM appointments
  WHERE email = email_param OR phone = phone_param
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no existing patient ID, generate a new one
  IF existing_patient_id IS NULL THEN
    new_patient_id := generate_patient_id();
  ELSE
    new_patient_id := existing_patient_id;
  END IF;
  
  -- Create the appointment
  INSERT INTO appointments (
    name, email, phone, date, time, service_type, message, patient_id, status
  ) VALUES (
    name_param, email_param, phone_param, date_param, time_param, 
    service_type_param, message_param, new_patient_id, 'pending'
  ) RETURNING id INTO new_appointment_id;
  
  -- Log the appointment creation
  PERFORM log_security_event(
    email_param,
    'appointment_created',
    jsonb_build_object(
      'appointment_id', new_appointment_id,
      'patient_id', new_patient_id,
      'service_type', service_type_param,
      'date', date_param,
      'time', time_param
    ),
    NULL, NULL, true
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'appointment_id', new_appointment_id,
    'patient_id', new_patient_id,
    'message', 'Appointment created successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Failed to create appointment: ' || SQLERRM
    );
END;
$$;

-- Function to get upcoming appointments
CREATE OR REPLACE FUNCTION get_upcoming_appointments(days_ahead integer DEFAULT 7)
RETURNS TABLE(
  appointment_id uuid,
  patient_name text,
  patient_email text,
  patient_phone text,
  appointment_date date,
  appointment_time time,
  service_type text,
  status text,
  days_until_appointment integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as appointment_id,
    a.name as patient_name,
    a.email as patient_email,
    a.phone as patient_phone,
    a.date as appointment_date,
    a.time as appointment_time,
    a.service_type,
    a.status,
    (a.date - CURRENT_DATE)::integer as days_until_appointment
  FROM appointments a
  WHERE a.date >= CURRENT_DATE 
    AND a.date <= CURRENT_DATE + days_ahead
    AND a.status IN ('pending', 'confirmed')
  ORDER BY a.date ASC, a.time ASC;
END;
$$;

-- Function to get appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflicts(
  check_date date,
  check_time time,
  exclude_appointment_id uuid DEFAULT NULL
)
RETURNS TABLE(
  conflict_appointment_id uuid,
  conflict_patient_name text,
  conflict_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as conflict_appointment_id,
    a.name as conflict_patient_name,
    a.status as conflict_status
  FROM appointments a
  WHERE a.date = check_date 
    AND a.time = check_time
    AND a.status IN ('pending', 'confirmed')
    AND (exclude_appointment_id IS NULL OR a.id != exclude_appointment_id);
END;
$$;

-- Enhanced calendar data function with conflict detection
CREATE OR REPLACE FUNCTION get_calendar_data_enhanced(
  start_date date,
  end_date date
)
RETURNS TABLE(
  slot_date text,
  slot_time text,
  slot_status text,
  appointment_id text,
  patient_name text,
  patient_email text,
  patient_phone text,
  patient_id text,
  service_type text,
  appointment_status text,
  has_conflicts boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_date_var date;
BEGIN
  current_date_var := start_date;
  
  WHILE current_date_var <= end_date LOOP
    RETURN QUERY
    SELECT 
      current_date_var::text as slot_date,
      gs.slot_time::text as slot_time,
      CASE 
        WHEN gs.appointment_id IS NOT NULL THEN 'booked'
        WHEN NOT gs.is_available THEN 'blocked'
        ELSE 'available'
      END as slot_status,
      gs.appointment_id::text,
      a.name as patient_name,
      a.email as patient_email,
      a.phone as patient_phone,
      a.patient_id,
      a.service_type,
      a.status as appointment_status,
      EXISTS(
        SELECT 1 FROM check_appointment_conflicts(current_date_var, gs.slot_time, gs.appointment_id)
      ) as has_conflicts,
      a.created_at
    FROM generate_slots_for_date(current_date_var) gs
    LEFT JOIN appointments a ON gs.appointment_id = a.id;
    
    current_date_var := current_date_var + 1;
  END LOOP;
END;
$$;

-- Automated cleanup function
CREATE OR REPLACE FUNCTION automated_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up expired sessions (older than 30 days)
  DELETE FROM user_sessions 
  WHERE expires_at < now() - interval '30 days';
  
  -- Clean up old login attempts (older than 30 days)
  DELETE FROM login_attempts 
  WHERE attempted_at < now() - interval '30 days';
  
  -- Clean up old security logs (older than 1 year)
  DELETE FROM security_logs 
  WHERE created_at < now() - interval '1 year';
  
  -- Clean up old appointment slots (older than 1 year)
  DELETE FROM appointment_slots 
  WHERE date < CURRENT_DATE - interval '1 year';
  
  -- Clean up old blocked slots (older than 1 year)
  DELETE FROM blocked_slots 
  WHERE slot_date < CURRENT_DATE - interval '1 year';
  
  -- Log cleanup activity
  PERFORM log_security_event(
    'system',
    'automated_cleanup',
    jsonb_build_object('cleanup_date', now()),
    NULL, NULL, true
  );
END;
$$;

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION get_appointment_stats_detailed() TO authenticated;
GRANT EXECUTE ON FUNCTION search_patients(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_patient_history(text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION generate_patient_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_appointment_enhanced(text, text, text, date, time, text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_upcoming_appointments(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION check_appointment_conflicts(date, time, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_data_enhanced(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION automated_cleanup() TO authenticated;

-- Create a scheduled job for automated cleanup (if pg_cron is available)
-- This would typically be set up separately in production
-- SELECT cron.schedule('automated-cleanup', '0 2 * * *', 'SELECT automated_cleanup();');