/*
  # Fix generate_series error in calendar function

  1. Problem
    - The generate_series function doesn't support time without time zone arguments
    - This causes the get_calendar_data_enhanced function to fail

  2. Solution
    - Replace the problematic generate_series call in blocked_times CTE
    - Use integer-based series generation with interval arithmetic
    - Calculate number of 30-minute slots between start and end times
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_calendar_data_enhanced(text, text);

-- Recreate the function with fixed generate_series usage
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
      GREATEST(0, EXTRACT(EPOCH FROM (cs.end_time - cs.start_time)) / EXTRACT(EPOCH FROM cs.slot_duration) - 1)::integer
    ) AS gs(slot_num)
    WHERE cs.is_active = true
      AND EXTRACT(DOW FROM ds.slot_date) = cs.day_of_week
      AND cs.start_time + (gs.slot_num * cs.slot_duration) < cs.end_time
  ),
  blocked_times AS (
    SELECT 
      bs.slot_date,
      bs.start_time + (slot_interval.interval_num * '00:30:00'::interval) AS blocked_time
    FROM blocked_slots bs
    CROSS JOIN generate_series(
      0, 
      GREATEST(0, EXTRACT(EPOCH FROM (bs.end_time - bs.start_time)) / 1800 - 1)::integer
    ) AS slot_interval(interval_num)
    WHERE bs.slot_date BETWEEN start_date::date AND end_date::date
      AND bs.start_time + (slot_interval.interval_num * '00:30:00'::interval) < bs.end_time
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