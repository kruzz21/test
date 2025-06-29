-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_calendar_data(date, date);
DROP FUNCTION IF EXISTS block_time_slots(date, time, time, text);
DROP FUNCTION IF EXISTS is_admin();

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get user role from session or headers
  SELECT role INTO user_role
  FROM users
  WHERE email = (
    SELECT COALESCE(
      (current_setting('request.headers', true)::json ->> 'x-user-email'),
      (current_setting('request.jwt.claims', true)::json ->> 'email')
    )
  );
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$;

-- Main function to get calendar data
CREATE FUNCTION get_calendar_data(
  start_date date,
  end_date date
)
RETURNS TABLE (
  slot_date text,
  slot_time text,
  slot_status text,
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
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(start_date::date, end_date::date, '1 day'::interval)::date as calendar_date
  ),
  time_slots AS (
    SELECT 
      ds.calendar_date,
      generate_series(
        cs.start_time::time,
        cs.end_time::time - cs.slot_duration,
        cs.slot_duration
      )::time as time_value
    FROM date_series ds
    CROSS JOIN calendar_slots cs
    WHERE cs.is_active = true
      AND EXTRACT(dow FROM ds.calendar_date) = cs.day_of_week
  ),
  all_slots AS (
    SELECT 
      ts.calendar_date::text as date_str,
      ts.time_value::text as time_str,
      CASE 
        -- Check if slot is blocked
        WHEN EXISTS (
          SELECT 1 FROM blocked_slots bs
          WHERE bs.slot_date = ts.calendar_date
            AND ts.time_value >= bs.start_time
            AND ts.time_value < bs.end_time
        ) THEN 'blocked'
        -- Check if slot has appointment
        WHEN EXISTS (
          SELECT 1 FROM appointments a
          WHERE a.date = ts.calendar_date
            AND a.time = ts.time_value
            AND a.status != 'cancelled'
        ) THEN 'booked'
        ELSE 'available'
      END as status_value,
      a.id::text as appt_id,
      a.name as appt_name,
      a.email as appt_email,
      a.phone as appt_phone,
      a.service_type as appt_service,
      a.status as appt_status
    FROM time_slots ts
    LEFT JOIN appointments a ON (
      a.date = ts.calendar_date 
      AND a.time = ts.time_value 
      AND a.status != 'cancelled'
    )
  )
  SELECT 
    als.date_str,
    als.time_str,
    als.status_value,
    als.appt_id,
    als.appt_name,
    als.appt_email,
    als.appt_phone,
    als.appt_service,
    als.appt_status
  FROM all_slots als
  ORDER BY als.date_str, als.time_str;
END;
$$;

-- Function to block time slots
CREATE FUNCTION block_time_slots(
  block_date date,
  start_time_param time,
  end_time_param time,
  reason_param text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized: Admin access required');
  END IF;

  -- Insert blocked slot
  INSERT INTO blocked_slots (slot_date, start_time, end_time, reason, blocked_by)
  VALUES (
    block_date,
    start_time_param,
    end_time_param,
    reason_param,
    (current_setting('request.headers', true)::json ->> 'x-user-email')
  );

  RETURN json_build_object('success', true, 'message', 'Time slot blocked successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_calendar_data(date, date) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION block_time_slots(date, time, time, text) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;