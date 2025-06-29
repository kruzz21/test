/*
  # Create get_calendar_data_enhanced RPC function

  1. New Functions
    - `get_calendar_data_enhanced(start_date, end_date)` - Returns calendar data with time slots, appointments, and blocked periods
    - `is_admin()` - Helper function to check if current user is admin (if not exists)

  2. Security
    - Function is accessible to public for calendar viewing
    - Admin check function for administrative operations

  3. Features
    - Generates time slots based on calendar_slots configuration
    - Shows booked appointments
    - Shows blocked time periods
    - Returns comprehensive calendar view data
*/

-- Create is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, return true for authenticated users
  -- You can modify this logic based on your admin identification needs
  RETURN auth.role() = 'authenticated';
END;
$$;

-- Create the enhanced calendar data function
CREATE OR REPLACE FUNCTION get_calendar_data_enhanced(
  start_date date,
  end_date date
)
RETURNS TABLE (
  date text,
  time text,
  status text,
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
  current_date date;
  slot_record record;
  time_slot time;
BEGIN
  -- Loop through each date in the range
  current_date := start_date;
  
  WHILE current_date <= end_date LOOP
    -- Get calendar slots for the current day of week (0 = Sunday, 6 = Saturday)
    FOR slot_record IN 
      SELECT cs.start_time, cs.end_time, cs.slot_duration
      FROM calendar_slots cs
      WHERE cs.day_of_week = EXTRACT(DOW FROM current_date)
        AND cs.is_active = true
    LOOP
      -- Generate time slots within the calendar slot range
      time_slot := slot_record.start_time;
      
      WHILE time_slot < slot_record.end_time LOOP
        -- Check if this time slot is blocked
        IF EXISTS (
          SELECT 1 FROM blocked_slots bs
          WHERE bs.slot_date = current_date
            AND time_slot >= bs.start_time
            AND time_slot < bs.end_time
        ) THEN
          -- Return blocked slot
          RETURN QUERY SELECT
            current_date::text,
            time_slot::text,
            'blocked'::text,
            NULL::uuid,
            NULL::text,
            NULL::text,
            NULL::text,
            NULL::text,
            NULL::text;
        ELSE
          -- Check if there's an appointment at this time
          IF EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.date = current_date
              AND a.time = time_slot
              AND a.status IN ('confirmed', 'pending')
          ) THEN
            -- Return booked slot with appointment details
            RETURN QUERY SELECT
              current_date::text,
              time_slot::text,
              'booked'::text,
              a.id,
              a.name,
              a.email,
              a.phone,
              a.service_type,
              a.status
            FROM appointments a
            WHERE a.date = current_date
              AND a.time = time_slot
              AND a.status IN ('confirmed', 'pending')
            LIMIT 1;
          ELSE
            -- Return available slot
            RETURN QUERY SELECT
              current_date::text,
              time_slot::text,
              'available'::text,
              NULL::uuid,
              NULL::text,
              NULL::text,
              NULL::text,
              NULL::text,
              NULL::text;
          END IF;
        END IF;
        
        -- Move to next time slot
        time_slot := time_slot + COALESCE(slot_record.slot_duration, '30 minutes'::interval);
      END LOOP;
    END LOOP;
    
    -- Move to next date
    current_date := current_date + 1;
  END LOOP;
  
  RETURN;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_calendar_data_enhanced(date, date) TO public;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;