/*
  # Fix appointment system migration

  1. Tables
    - Update existing appointment_slots table structure
    - Update existing appointments table structure to match current schema
    
  2. Security
    - Enable RLS on both tables
    - Add policies for public and authenticated access
    
  3. Functions and Triggers
    - Create update timestamp function
    - Create slot availability sync function
    - Add triggers for both functions
    
  4. Sample Data
    - Insert appointment slots for next 30 days
*/

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
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS sync_slot_availability ON appointments;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS sync_appointment_slot_availability();

-- Update appointment_slots table structure
DO $$
BEGIN
  -- Add available column if it doesn't exist (rename from is_available)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointment_slots' AND column_name = 'available'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'appointment_slots' AND column_name = 'is_available'
    ) THEN
      ALTER TABLE appointment_slots RENAME COLUMN is_available TO available;
    ELSE
      ALTER TABLE appointment_slots ADD COLUMN available boolean DEFAULT true;
    END IF;
  END IF;
END $$;

-- Update appointments table structure to match existing schema
DO $$
BEGIN
  -- Add name column if it doesn't exist (rename from patient_name)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'name'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'patient_name'
    ) THEN
      ALTER TABLE appointments RENAME COLUMN patient_name TO name;
    ELSE
      ALTER TABLE appointments ADD COLUMN name text NOT NULL DEFAULT '';
    END IF;
  END IF;

  -- Add email column if it doesn't exist (rename from patient_email)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'email'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'patient_email'
    ) THEN
      ALTER TABLE appointments RENAME COLUMN patient_email TO email;
    ELSE
      ALTER TABLE appointments ADD COLUMN email text NOT NULL DEFAULT '';
    END IF;
  END IF;

  -- Add phone column if it doesn't exist (rename from patient_phone)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'phone'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'patient_phone'
    ) THEN
      ALTER TABLE appointments RENAME COLUMN patient_phone TO phone;
    ELSE
      ALTER TABLE appointments ADD COLUMN phone text NOT NULL DEFAULT '';
    END IF;
  END IF;

  -- Add date column if it doesn't exist (rename from appointment_date)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'date'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'appointment_date'
    ) THEN
      ALTER TABLE appointments RENAME COLUMN appointment_date TO date;
    ELSE
      ALTER TABLE appointments ADD COLUMN date date NOT NULL DEFAULT CURRENT_DATE;
    END IF;
  END IF;

  -- Add time column if it doesn't exist (rename from appointment_time)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'time'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'appointment_time'
    ) THEN
      ALTER TABLE appointments RENAME COLUMN appointment_time TO time;
    ELSE
      ALTER TABLE appointments ADD COLUMN time time NOT NULL DEFAULT '09:00';
    END IF;
  END IF;

  -- Ensure status column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'status'
  ) THEN
    ALTER TABLE appointments ADD COLUMN status text DEFAULT 'pending';
  END IF;

  -- Ensure service_type column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE appointments ADD COLUMN service_type text;
  END IF;

  -- Ensure message column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'message'
  ) THEN
    ALTER TABLE appointments ADD COLUMN message text;
  END IF;

  -- Ensure updated_at column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE appointments ADD COLUMN updated_at timestamptz DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Add unique constraint for appointment_slots
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointment_slots_date_time_unique'
  ) THEN
    ALTER TABLE appointment_slots ADD CONSTRAINT appointment_slots_date_time_unique UNIQUE(date, time);
  END IF;
END $$;

-- Add constraints for appointments
DO $$
BEGIN
  -- Status validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointments_status_check_new'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_status_check_new 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
  END IF;

  -- Email validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointments_email_check_new'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_email_check_new 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  -- Phone validation (more flexible)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointments_phone_check_new'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_phone_check_new 
    CHECK (length(phone) >= 10);
  END IF;

  -- Future date constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointments_future_date_check_new'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_future_date_check_new 
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