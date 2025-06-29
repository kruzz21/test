/*
  # Fix Time Slots Display Issue

  1. Updates
    - Fix get_available_slots_enhanced function to return proper time format
    - Add get_all_slots_for_date function to show all slots (available and unavailable)
    - Enhance generate_slots_for_date function with fallback default slots
    - Use proper column names to avoid PostgreSQL reserved keywords

  2. Security
    - Grant execute permissions to authenticated and anonymous users
    - Maintain security definer for proper access control
*/

-- Drop and recreate the get_available_slots_enhanced function with proper return types
DROP FUNCTION IF EXISTS get_available_slots_enhanced(date);

-- Function to get available slots for user booking (fixed)
CREATE OR REPLACE FUNCTION get_available_slots_enhanced(target_date date)
RETURNS TABLE(
  id text,
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
    gen_random_uuid()::text as id,
    gs.slot_time::text as slot_time,
    gs.is_available as available,
    now() as created_at
  FROM generate_slots_for_date(target_date) gs
  ORDER BY gs.slot_time;
END;
$$;

-- Enhanced function to get ALL slots (available and unavailable) for better UX
CREATE OR REPLACE FUNCTION get_all_slots_for_date(target_date date)
RETURNS TABLE(
  id text,
  slot_time text,
  available boolean,
  appointment_id text,
  patient_name text,
  slot_status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gen_random_uuid()::text as id,
    gs.slot_time::text as slot_time,
    gs.is_available as available,
    gs.appointment_id::text as appointment_id,
    COALESCE(a.name, '') as patient_name,
    COALESCE(a.status, '') as slot_status,
    now() as created_at
  FROM generate_slots_for_date(target_date) gs
  LEFT JOIN appointments a ON gs.appointment_id = a.id
  ORDER BY gs.slot_time;
END;
$$;

-- Fix the generate_slots_for_date function to ensure it always returns slots
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
  temp_appointment_id uuid;
  temp_appointment_status text;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week_val := EXTRACT(dow FROM target_date);
  
  -- If no calendar slots exist for this day, create default slots
  IF NOT EXISTS (
    SELECT 1 FROM calendar_slots 
    WHERE day_of_week = day_of_week_val AND is_active = true
  ) THEN
    -- Return default business hours if no calendar slots configured
    -- 9 AM to 5 PM with 30-minute slots, excluding lunch (12-1 PM)
    FOR slot_time_var IN 
      SELECT time_slot::time
      FROM generate_series(
        '09:00'::time,
        '11:30'::time,
        '30 minutes'::interval
      ) AS time_slot
      UNION ALL
      SELECT time_slot::time
      FROM generate_series(
        '13:00'::time,
        '17:00'::time,
        '30 minutes'::interval
      ) AS time_slot
      ORDER BY 1
    LOOP
      -- Check if slot is blocked
      IF NOT EXISTS (
        SELECT 1 FROM blocked_slots 
        WHERE slot_date = target_date 
          AND start_time <= slot_time_var 
          AND end_time > slot_time_var
      ) THEN
        -- Check if slot has an appointment
        SELECT a.id, a.status INTO temp_appointment_id, temp_appointment_status
        FROM appointments a
        WHERE a.date = target_date 
          AND a.time = slot_time_var
          AND a.status IN ('pending', 'confirmed')
        LIMIT 1;
        
        -- Return slot information
        slot_time := slot_time_var;
        is_available := (temp_appointment_id IS NULL);
        appointment_id := temp_appointment_id;
        appointment_status := temp_appointment_status;
        
        RETURN NEXT;
        
        -- Reset for next iteration
        temp_appointment_id := NULL;
        temp_appointment_status := NULL;
      END IF;
    END LOOP;
    
    RETURN;
  END IF;
  
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
        SELECT a.id, a.status INTO temp_appointment_id, temp_appointment_status
        FROM appointments a
        WHERE a.date = target_date 
          AND a.time = slot_time_var
          AND a.status IN ('pending', 'confirmed')
        LIMIT 1;
        
        -- Return slot information
        slot_time := slot_time_var;
        is_available := (temp_appointment_id IS NULL);
        appointment_id := temp_appointment_id;
        appointment_status := temp_appointment_status;
        
        RETURN NEXT;
        
        -- Reset for next iteration
        temp_appointment_id := NULL;
        temp_appointment_status := NULL;
      END IF;
      
      slot_time_var := slot_time_var + slot_duration_val;
    END LOOP;
  END LOOP;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_available_slots_enhanced(date) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_all_slots_for_date(date) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION generate_slots_for_date(date) TO authenticated, anon;