/*
  # Fix calendar data enhanced function

  1. New Functions
    - `get_calendar_data_enhanced` - Returns enhanced calendar data with appointment details
    
  2. Function Details
    - Takes start_date and end_date as text parameters (YYYY-MM-DD format)
    - Returns calendar slots with appointment information
    - Handles available, booked, and blocked slot statuses
    - Includes patient information for booked appointments
*/

-- Drop function if it exists to recreate with correct signature
DROP FUNCTION IF EXISTS get_calendar_data_enhanced(text, text);

-- Create the enhanced calendar data function
CREATE OR REPLACE FUNCTION get_calendar_data_enhanced(
  start_date text,
  end_date text
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
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      start_date::date,
      end_date::date,
      '1 day'::interval
    )::date AS slot_date
  ),
  time_slots AS (
    SELECT 
      ds.slot_date,
      cs.start_time + (gs.slot_num * cs.slot_duration) AS slot_time
    FROM date_series ds
    CROSS JOIN calendar_slots cs
    CROSS JOIN generate_series(0, 
      EXTRACT(EPOCH FROM (cs.end_time - cs.start_time)) / EXTRACT(EPOCH FROM cs.slot_duration) - 1
    ) AS gs(slot_num)
    WHERE cs.is_active = true
      AND EXTRACT(DOW FROM ds.slot_date) = cs.day_of_week
      AND cs.start_time + (gs.slot_num * cs.slot_duration) < cs.end_time
  ),
  blocked_times AS (
    SELECT 
      bs.slot_date,
      generate_series(
        bs.start_time,
        bs.end_time - '00:30:00'::interval,
        '00:30:00'::interval
      ) AS blocked_time
    FROM blocked_slots bs
    WHERE bs.slot_date BETWEEN start_date::date AND end_date::date
  )
  SELECT 
    ts.slot_date::text AS date,
    ts.slot_time::text AS time,
    CASE 
      WHEN a.id IS NOT NULL THEN 'booked'
      WHEN bt.blocked_time IS NOT NULL THEN 'blocked'
      ELSE 'available'
    END AS status,
    a.id AS appointment_id,
    a.name AS patient_name,
    a.email AS patient_email,
    a.phone AS patient_phone,
    a.service_type,
    a.status AS appointment_status
  FROM time_slots ts
  LEFT JOIN appointments a ON a.date = ts.slot_date AND a.time = ts.slot_time
  LEFT JOIN blocked_times bt ON bt.slot_date = ts.slot_date AND bt.blocked_time = ts.slot_time
  WHERE ts.slot_date BETWEEN start_date::date AND end_date::date
  ORDER BY ts.slot_date, ts.slot_time;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_calendar_data_enhanced(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_data_enhanced(text, text) TO anon;