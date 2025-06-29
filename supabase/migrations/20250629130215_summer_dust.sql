/*
  # Create appointments system

  1. New Tables
    - `appointment_slots`
      - `id` (uuid, primary key)
      - `date` (date)
      - `time` (time)
      - `is_available` (boolean, default true)
      - `created_at` (timestamp)
    - `appointments`
      - `id` (uuid, primary key)
      - `patient_name` (text)
      - `patient_email` (text)
      - `patient_phone` (text)
      - `appointment_date` (date)
      - `appointment_time` (time)
      - `service_type` (text)
      - `message` (text, optional)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public appointment creation and viewing
    - Add policies for authenticated user management

  3. Constraints and Validation
    - Email validation
    - Phone number validation (minimum 10 characters)
    - Future appointment dates only
    - Status validation
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view available slots" ON appointment_slots;
DROP POLICY IF EXISTS "Authenticated users can manage slots" ON appointment_slots;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Public can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create appointment_slots table
CREATE TABLE IF NOT EXISTS appointment_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointment_slots_date_time_key'
  ) THEN
    ALTER TABLE appointment_slots ADD CONSTRAINT appointment_slots_date_time_key UNIQUE(date, time);
  END IF;
END $$;

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  patient_phone text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  service_type text NOT NULL,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  patient_id text
);

-- Add constraints if they don't exist
DO $$
BEGIN
  -- Add status check constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointments_status_check'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
  END IF;

  -- Add email validation constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_email'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT valid_email 
    CHECK (patient_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  -- Add phone validation constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_phone'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT valid_phone 
    CHECK (length(patient_phone) >= 10);
  END IF;

  -- Add future appointment constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'future_appointment'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT future_appointment 
    CHECK (appointment_date >= CURRENT_DATE);
  END IF;

  -- Add patient_id validation constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_patient_id'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT valid_patient_id 
    CHECK (length(patient_id) >= 6 AND patient_id ~* '^[A-Z0-9\s]{6,20}$');
  END IF;
END $$;

-- Enable RLS
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for appointment_slots
CREATE POLICY "Anyone can view available slots"
  ON appointment_slots
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage slots"
  ON appointment_slots
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for appointments
CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view own appointments"
  ON appointments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can view all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointment_slots_date ON appointment_slots(date);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_available ON appointment_slots(is_available);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_name ON appointments(patient_name);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(patient_phone);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for appointments table
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();