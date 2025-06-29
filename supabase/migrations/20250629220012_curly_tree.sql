/*
  # Enhanced Calendar System Migration

  1. New Tables
    - `calendar_slots` - Defines recurring availability patterns by day of week
    - `blocked_slots` - Specific blocked time slots

  2. Enhanced Functions
    - `generate_slots_for_date()` - Generates available time slots for any date
    - `get_calendar_data()` - Admin calendar view with all slot information
    - `get_available_slots_enhanced()` - User booking interface slots
    - `block_time_slots()` - Block specific time ranges

  3. Security
    - Enable RLS on new tables
    - Admin-only policies for management
    - Public read access for booking

  4. Default Schedule
    - Monday-Friday 9 AM to 5 PM with lunch break
    - 30-minute appointment slots
*/

-- Add patient_id column to appointments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN patient_id text;
  END IF;
END $$;

-- Add constraint for patient_id format if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_patient_id'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT valid_patient_id 
    CHECK (patient_id IS NULL OR (length(patient_id) >= 6 AND patient_id ~* '^[A-Z0-9\s]{6,20}$'));
  END IF;
END $$;

-- Update existing constraints to use proper names
DO $$
BEGIN
  -- Add proper constraints if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_email_valid') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_email_valid 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_phone_valid') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_phone_valid 
    CHECK (length(phone) >= 10);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_future_date') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_future_date 
    CHECK (date >= CURRENT_DATE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_status_valid') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_status_valid 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
  END IF;
END $$;

-- Create calendar_slots table for recurring availability patterns
CREATE TABLE IF NOT EXISTS calendar_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time time NOT NULL,
  end_time time NOT NULL,
  slot_duration interval DEFAULT '30 minutes',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blocked_slots table for specific blocked times
CREATE TABLE IF NOT EXISTS blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  reason text,
  blocked_by text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE calendar_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can manage calendar slots" ON calendar_slots;
  DROP POLICY IF EXISTS "Public can view active calendar slots" ON calendar_slots;
  DROP POLICY IF EXISTS "Admins can manage blocked slots" ON blocked_slots;
  DROP POLICY IF EXISTS "Public can view blocked slots" ON blocked_slots;
END $$;

-- Create policies
CREATE POLICY "Admins can manage calendar slots"
  ON calendar_slots
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Public can view active calendar slots"
  ON calendar_slots
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage blocked slots"
  ON blocked_slots
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Public can view blocked slots"
  ON blocked_slots
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_slots_day_active ON calendar_slots(day_of_week, is_active);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date_time ON blocked_slots(slot_date, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_date_available ON appointment_slots(date, available);

-- Function to generate time slots for a specific date
CREATE OR REPLACE FUNCTION generate_slots_for_date(target_date date)
RETURNS TABLE(
  slot_time time,
  is_available boolean,
  appointment_id uuid,
  appointment_status text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  day_of_week_val integer;
  slot_record calendar_slots%ROWTYPE;
  slot_time_var time;
  slot_duration_val interval;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week_val := EXTRACT(dow FROM target_date);
  
  -- Loop through all active calendar slots for this day
  FOR slot_record IN 
    SELECT * FROM calendar_slots 
    WHERE day_of_week = day_of_week_val AND is_active = true
    ORDER BY start_time
  LOOP
    slot_time_var := slot_record.start_time;
    slot_duration_val := COALESCE(slot_record.slot_duration, '30 minutes'::interval);
    
    -- Generate individual time slots
    WHILE slot_time_var < slot_record.end_time LOOP
      -- Check if slot is blocked
      IF NOT EXISTS (
        SELECT 1 FROM blocked_slots 
        WHERE slot_date = target_date 
          AND start_time <= slot_time_var 
          AND end_time > slot_time_var
      ) THEN
        -- Check if slot has an appointment
        SELECT a.id, a.status INTO appointment_id, appointment_status
        FROM appointments a
        WHERE a.date = target_date 
          AND a.time = slot_time_var
          AND a.status IN ('pending', 'confirmed')
        LIMIT 1;
        
        -- Return slot information
        slot_time := slot_time_var;
        is_available := (appointment_id IS NULL);
        
        RETURN NEXT;
        
        -- Reset for next iteration
        appointment_id := NULL;
        appointment_status := NULL;
      END IF;
      
      slot_time_var := slot_time_var + slot_duration_val;
    END LOOP;
  END LOOP;
END;
$$;

-- Function to get calendar data for admin panel
CREATE OR REPLACE FUNCTION get_calendar_data(
  start_date date,
  end_date date
)
RETURNS TABLE(
  slot_date text,
  slot_time text,
  slot_status text, -- 'available', 'booked', 'blocked'
  appointment_id text,
  patient_name text,
  patient_email text,
  patient_phone text,
  service_type text,
  appointment_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_date_var date;
BEGIN
  current_date_var := start_date;
  
  WHILE current_date_var <= end_date LOOP
    -- Get all slots for this date
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
      a.service_type,
      a.status as appointment_status
    FROM generate_slots_for_date(current_date_var) gs
    LEFT JOIN appointments a ON gs.appointment_id = a.id;
    
    current_date_var := current_date_var + 1;
  END LOOP;
END;
$$;

-- Function to get available slots for user booking (enhanced)
CREATE OR REPLACE FUNCTION get_available_slots_enhanced(target_date date)
RETURNS TABLE(
  slot_id text,
  slot_time text,
  available boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gen_random_uuid()::text as slot_id,
    gs.slot_time::text as slot_time,
    gs.is_available as available,
    now() as created_at
  FROM generate_slots_for_date(target_date) gs
  WHERE gs.is_available = true
  ORDER BY gs.slot_time;
END;
$$;

-- Function to block time slots
CREATE OR REPLACE FUNCTION block_time_slots(
  block_date date,
  start_time_param time,
  end_time_param time,
  reason_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  blocked_slot_id uuid;
BEGIN
  -- Validate input
  IF block_date < CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cannot block slots in the past'
    );
  END IF;
  
  IF start_time_param >= end_time_param THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Start time must be before end time'
    );
  END IF;
  
  -- Check for existing appointments in this time range
  IF EXISTS (
    SELECT 1 FROM appointments 
    WHERE date = block_date 
      AND time >= start_time_param 
      AND time < end_time_param
      AND status IN ('pending', 'confirmed')
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cannot block slots with existing appointments'
    );
  END IF;
  
  -- Create blocked slot
  INSERT INTO blocked_slots (slot_date, start_time, end_time, reason)
  VALUES (block_date, start_time_param, end_time_param, reason_param)
  RETURNING id INTO blocked_slot_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Time slots blocked successfully',
    'blocked_slot_id', blocked_slot_id
  );
END;
$$;

-- Insert default calendar slots (Monday to Friday, 9 AM to 5 PM, excluding lunch)
INSERT INTO calendar_slots (day_of_week, start_time, end_time, slot_duration, is_active)
VALUES 
  -- Monday
  (1, '09:00', '12:00', '30 minutes', true),
  (1, '13:00', '17:00', '30 minutes', true),
  -- Tuesday  
  (2, '09:00', '12:00', '30 minutes', true),
  (2, '13:00', '17:00', '30 minutes', true),
  -- Wednesday
  (3, '09:00', '12:00', '30 minutes', true),
  (3, '13:00', '17:00', '30 minutes', true),
  -- Thursday
  (4, '09:00', '12:00', '30 minutes', true),
  (4, '13:00', '17:00', '30 minutes', true),
  -- Friday
  (5, '09:00', '12:00', '30 minutes', true),
  (5, '13:00', '17:00', '30 minutes', true)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_slots_for_date(date) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_calendar_data(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION block_time_slots(date, time, time, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_slots_enhanced(date) TO authenticated, anon;