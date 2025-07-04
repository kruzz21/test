/*
  # Calendar System Migration - Fixed Syntax Errors

  1. New Tables
    - `calendar_slots` - Recurring availability patterns by day of week
    - `blocked_slots` - Specific blocked time ranges
    
  2. Enhanced Appointments
    - Add patient_id column with validation
    - Update constraint names for consistency
    
  3. Calendar Functions
    - `generate_slots_for_date` - Generate available slots for a specific date
    - `get_calendar_data` - Get calendar data for admin panel
    - `block_time_slots` - Block specific time ranges
    - `unblock_time_slots` - Unblock time ranges
    - `set_recurring_availability` - Set recurring availability patterns
    - `get_available_slots_enhanced` - Enhanced slot retrieval for booking
    
  4. Security
    - Enable RLS on new tables
    - Add appropriate policies for admin and public access
    
  5. Default Data
    - Insert default availability patterns (Mon-Fri, 9AM-5PM with lunch break)
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

-- Add constraint for patient_id format
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
  -- Drop old constraints if they exist
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_email_check_new') THEN
    ALTER TABLE appointments DROP CONSTRAINT appointments_email_check_new;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_phone_check_new') THEN
    ALTER TABLE appointments DROP CONSTRAINT appointments_phone_check_new;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_future_date_check_new') THEN
    ALTER TABLE appointments DROP CONSTRAINT appointments_future_date_check_new;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_status_check_new') THEN
    ALTER TABLE appointments DROP CONSTRAINT appointments_status_check_new;
  END IF;

  -- Add proper constraints
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
  blocked_by text, -- Changed from uuid reference to text for simplicity
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE calendar_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

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
  time_cursor time;
  slot_duration_val interval;
  temp_appointment_id uuid;
  temp_appointment_status text;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week_val := EXTRACT(dow FROM target_date);
  
  -- Loop through all active calendar slots for this day
  FOR slot_record IN 
    SELECT * FROM calendar_slots 
    WHERE day_of_week = day_of_week_val AND is_active = true
    ORDER BY start_time
  LOOP
    time_cursor := slot_record.start_time;
    slot_duration_val := COALESCE(slot_record.slot_duration, '30 minutes'::interval);
    
    -- Generate individual time slots
    WHILE time_cursor < slot_record.end_time LOOP
      -- Check if slot is blocked
      IF NOT EXISTS (
        SELECT 1 FROM blocked_slots 
        WHERE slot_date = target_date 
          AND start_time <= time_cursor 
          AND end_time > time_cursor
      ) THEN
        -- Check if slot has an appointment
        SELECT a.id, a.status INTO temp_appointment_id, temp_appointment_status
        FROM appointments a
        WHERE a.date = target_date 
          AND a.time = time_cursor
          AND a.status IN ('pending', 'confirmed')
        LIMIT 1;
        
        -- Return slot information
        slot_time := time_cursor;
        is_available := (temp_appointment_id IS NULL);
        appointment_id := temp_appointment_id;
        appointment_status := temp_appointment_status;
        
        RETURN NEXT;
        
        -- Reset for next iteration
        temp_appointment_id := NULL;
        temp_appointment_status := NULL;
      END IF;
      
      time_cursor := time_cursor + slot_duration_val;
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
  slot_date date,
  slot_time time,
  status text, -- 'available', 'booked', 'blocked'
  appointment_id uuid,
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
  date_cursor date;
BEGIN
  date_cursor := start_date;
  
  WHILE date_cursor <= end_date LOOP
    -- Get all slots for this date
    RETURN QUERY
    SELECT 
      date_cursor as slot_date,
      gs.slot_time as slot_time,
      CASE 
        WHEN gs.appointment_id IS NOT NULL THEN 'booked'
        WHEN NOT gs.is_available THEN 'blocked'
        ELSE 'available'
      END as status,
      gs.appointment_id,
      a.name as patient_name,
      a.email as patient_email,
      a.phone as patient_phone,
      a.service_type,
      a.status as appointment_status
    FROM generate_slots_for_date(date_cursor) gs
    LEFT JOIN appointments a ON gs.appointment_id = a.id;
    
    date_cursor := date_cursor + 1;
  END LOOP;
END;
$$;

-- Function to block time slots
CREATE OR REPLACE FUNCTION block_time_slots(
  block_date date,
  start_time_param time,
  end_time_param time,
  reason_param text DEFAULT NULL,
  blocked_by_param text DEFAULT NULL
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
  INSERT INTO blocked_slots (slot_date, start_time, end_time, reason, blocked_by)
  VALUES (block_date, start_time_param, end_time_param, reason_param, blocked_by_param)
  RETURNING id INTO blocked_slot_id;
  
  -- Update appointment_slots to mark as unavailable
  UPDATE appointment_slots 
  SET available = false
  WHERE date = block_date 
    AND time >= start_time_param 
    AND time < end_time_param;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Time slots blocked successfully',
    'blocked_slot_id', blocked_slot_id
  );
END;
$$;

-- Function to unblock time slots
CREATE OR REPLACE FUNCTION unblock_time_slots(blocked_slot_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  blocked_slot blocked_slots%ROWTYPE;
BEGIN
  -- Get blocked slot details
  SELECT * INTO blocked_slot FROM blocked_slots WHERE id = blocked_slot_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Blocked slot not found'
    );
  END IF;
  
  -- Remove blocked slot
  DELETE FROM blocked_slots WHERE id = blocked_slot_id;
  
  -- Update appointment_slots to mark as available (if no appointments)
  UPDATE appointment_slots 
  SET available = true
  WHERE date = blocked_slot.slot_date 
    AND time >= blocked_slot.start_time 
    AND time < blocked_slot.end_time
    AND NOT EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.date = appointment_slots.date 
        AND a.time = appointment_slots.time
        AND a.status IN ('pending', 'confirmed')
    );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Time slots unblocked successfully'
  );
END;
$$;

-- Function to set recurring availability pattern
CREATE OR REPLACE FUNCTION set_recurring_availability(
  day_of_week_param integer,
  start_time_param time,
  end_time_param time,
  slot_duration_param interval DEFAULT '30 minutes'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  slot_id uuid;
BEGIN
  -- Validate input
  IF day_of_week_param < 0 OR day_of_week_param > 6 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Day of week must be between 0 (Sunday) and 6 (Saturday)'
    );
  END IF;
  
  IF start_time_param >= end_time_param THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Start time must be before end time'
    );
  END IF;
  
  -- Insert calendar slot
  INSERT INTO calendar_slots (day_of_week, start_time, end_time, slot_duration, is_active)
  VALUES (day_of_week_param, start_time_param, end_time_param, slot_duration_param, true)
  RETURNING id INTO slot_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Recurring availability pattern set successfully',
    'slot_id', slot_id
  );
END;
$$;

-- Function to get available slots for user booking (enhanced)
CREATE OR REPLACE FUNCTION get_available_slots_enhanced(target_date date)
RETURNS TABLE(
  id uuid,
  slot_time time,
  available boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(aps.id, gen_random_uuid()) as id,
    gs.slot_time as slot_time,
    gs.is_available as available,
    COALESCE(aps.created_at, now()) as created_at
  FROM generate_slots_for_date(target_date) gs
  LEFT JOIN appointment_slots aps ON aps.date = target_date AND aps.time = gs.slot_time
  WHERE gs.is_available = true
  ORDER BY gs.slot_time;
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
GRANT EXECUTE ON FUNCTION block_time_slots(date, time, time, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION unblock_time_slots(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION set_recurring_availability(integer, time, time, interval) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_slots_enhanced(date) TO authenticated, anon;