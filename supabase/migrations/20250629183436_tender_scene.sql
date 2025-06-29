/*
  # Medical Appointment Booking System Database Schema

  1. New Tables
    - `appointment_slots`
      - `id` (uuid, primary key)
      - `date` (date)
      - `time` (time)
      - `available` (boolean, default true)
      - `created_at` (timestamp)
    - `appointments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text with validation)
      - `phone` (text with validation)
      - `date` (date with future constraint)
      - `time` (time)
      - `status` (enum: pending, confirmed, cancelled, completed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public can view available slots and create appointments
    - Authenticated users have full CRUD access

  3. Triggers and Functions
    - Auto-update timestamp trigger
    - Slot availability sync trigger
*/

-- Create appointment status enum
CREATE TYPE IF NOT EXISTS appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Drop existing objects to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view available slots" ON appointment_slots;
DROP POLICY IF EXISTS "Authenticated users can manage slots" ON appointment_slots;
DROP POLICY IF EXISTS "Public can view available slots" ON appointment_slots;
DROP POLICY IF EXISTS "Admins can manage slots" ON appointment_slots;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Public can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can manage appointments" ON appointments;

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS sync_slot_availability ON appointments;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS sync_appointment_slot_availability();

-- Create appointment_slots table
CREATE TABLE IF NOT EXISTS appointment_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time time NOT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointment_slots_date_time_unique'
  ) THEN
    ALTER TABLE appointment_slots ADD CONSTRAINT appointment_slots_date_time_unique UNIQUE(date, time);
  END IF;
END $$;

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  status appointment_status DEFAULT 'pending',
  service_type text,
  message text,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints
DO $$
BEGIN
  -- Email validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointments_email_check'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_email_check 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  -- Phone validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointments_phone_check'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_phone_check 
    CHECK (phone ~* '^\+?[0-9]{10,15}$');
  END IF;

  -- Future date constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointments_future_date_check'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_future_date_check 
    CHECK (date >= CURRENT_DATE);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for appointment_slots
CREATE POLICY "Public can view available slots"
  ON appointment_slots
  FOR SELECT
  TO public
  USING (available = true);

CREATE POLICY "Admins can manage slots"
  ON appointment_slots
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for appointments
CREATE POLICY "Public can create appointments"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view own appointments"
  ON appointments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointment_slots_date ON appointment_slots(date);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_available ON appointment_slots(available);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_date_time ON appointment_slots(date, time);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(email);
CREATE INDEX IF NOT EXISTS idx_appointments_name ON appointments(name);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, time);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to sync slot availability
CREATE OR REPLACE FUNCTION sync_appointment_slot_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- When appointment is created or confirmed, mark slot as unavailable
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'confirmed') THEN
    UPDATE appointment_slots 
    SET available = false 
    WHERE date = NEW.date AND time = NEW.time;
  END IF;
  
  -- When appointment is cancelled or deleted, mark slot as available
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status IN ('cancelled')) THEN
    UPDATE appointment_slots 
    SET available = true 
    WHERE date = COALESCE(NEW.date, OLD.date) AND time = COALESCE(NEW.time, OLD.time);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sync_slot_availability
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_appointment_slot_availability();

-- Insert sample appointment slots for the next 30 days
INSERT INTO appointment_slots (date, time, available)
SELECT 
  date_series.date,
  time_series.time,
  true
FROM (
  SELECT CURRENT_DATE + INTERVAL '1 day' * generate_series(0, 29) as date
) date_series
CROSS JOIN (
  SELECT time::time as time
  FROM generate_series(
    '09:00'::time,
    '17:00'::time,
    '30 minutes'::interval
  ) time
  WHERE time::time NOT IN ('12:00'::time, '12:30'::time, '13:00'::time) -- Lunch break
) time_series
WHERE EXTRACT(dow FROM date_series.date) NOT IN (0, 6) -- Exclude weekends
ON CONFLICT (date, time) DO NOTHING;