/*
  # Notification System

  1. New Tables
    - `notifications` - Store system notifications
    - `notification_preferences` - User notification preferences
    - `email_templates` - Email templates for automated notifications

  2. Functions
    - Send notifications for appointment status changes
    - Email reminder system
    - Admin notification system

  3. Security
    - RLS policies for notifications
    - Secure notification delivery
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  category text NOT NULL CHECK (category IN ('appointment', 'system', 'reminder', 'admin')),
  read boolean DEFAULT false,
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text UNIQUE NOT NULL,
  email_notifications boolean DEFAULT true,
  appointment_reminders boolean DEFAULT true,
  status_updates boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  reminder_hours_before integer DEFAULT 24,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text NOT NULL,
  variables jsonb, -- Available template variables
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_email = current_setting('request.headers', true)::json->>'x-user-email');

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_email = current_setting('request.headers', true)::json->>'x-user-email')
  WITH CHECK (user_email = current_setting('request.headers', true)::json->>'x-user-email');

CREATE POLICY "Admins can manage all notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can manage own preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (user_email = current_setting('request.headers', true)::json->>'x-user-email')
  WITH CHECK (user_email = current_setting('request.headers', true)::json->>'x-user-email');

CREATE POLICY "Admins can view email templates"
  ON email_templates
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can manage email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type_category ON notifications(type, category);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_email ON notification_preferences(user_email);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  user_email_param text,
  title_param text,
  message_param text,
  type_param text DEFAULT 'info',
  category_param text DEFAULT 'system',
  appointment_id_param uuid DEFAULT NULL,
  metadata_param jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_email, title, message, type, category, appointment_id, metadata
  ) VALUES (
    user_email_param, title_param, message_param, type_param, 
    category_param, appointment_id_param, metadata_param
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications 
  SET read = true, read_at = now()
  WHERE id = notification_id_param;
  
  RETURN FOUND;
END;
$$;

-- Function to get unread notifications count
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_email_param text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_result integer;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM notifications
  WHERE user_email = user_email_param AND read = false;
  
  RETURN count_result;
END;
$$;

-- Function to send appointment status notification
CREATE OR REPLACE FUNCTION send_appointment_status_notification(
  appointment_id_param uuid,
  old_status text,
  new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  appointment_record appointments%ROWTYPE;
  notification_title text;
  notification_message text;
  notification_type text;
BEGIN
  -- Get appointment details
  SELECT * INTO appointment_record
  FROM appointments
  WHERE id = appointment_id_param;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Determine notification content based on status change
  CASE new_status
    WHEN 'confirmed' THEN
      notification_title := 'Appointment Confirmed';
      notification_message := 'Your appointment for ' || appointment_record.service_type || 
                             ' on ' || appointment_record.date || ' at ' || appointment_record.time || 
                             ' has been confirmed.';
      notification_type := 'success';
    WHEN 'cancelled' THEN
      notification_title := 'Appointment Cancelled';
      notification_message := 'Your appointment for ' || appointment_record.service_type || 
                             ' on ' || appointment_record.date || ' at ' || appointment_record.time || 
                             ' has been cancelled.';
      notification_type := 'warning';
    WHEN 'completed' THEN
      notification_title := 'Appointment Completed';
      notification_message := 'Your appointment for ' || appointment_record.service_type || 
                             ' on ' || appointment_record.date || ' at ' || appointment_record.time || 
                             ' has been completed. Thank you for visiting us!';
      notification_type := 'success';
    ELSE
      RETURN; -- No notification for other status changes
  END CASE;
  
  -- Create notification
  PERFORM create_notification(
    appointment_record.email,
    notification_title,
    notification_message,
    notification_type,
    'appointment',
    appointment_id_param,
    jsonb_build_object(
      'old_status', old_status,
      'new_status', new_status,
      'appointment_date', appointment_record.date,
      'appointment_time', appointment_record.time
    )
  );
END;
$$;

-- Function to send appointment reminders
CREATE OR REPLACE FUNCTION send_appointment_reminders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reminder_count integer := 0;
  appointment_record appointments%ROWTYPE;
  reminder_hours integer;
BEGIN
  -- Get appointments that need reminders
  FOR appointment_record IN
    SELECT a.*
    FROM appointments a
    LEFT JOIN notification_preferences np ON np.user_email = a.email
    WHERE a.date = CURRENT_DATE + 1 -- Tomorrow's appointments
      AND a.status = 'confirmed'
      AND COALESCE(np.appointment_reminders, true) = true
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.appointment_id = a.id 
          AND n.category = 'reminder'
          AND n.created_at > CURRENT_DATE
      )
  LOOP
    -- Get reminder preference (default 24 hours)
    SELECT COALESCE(np.reminder_hours_before, 24) INTO reminder_hours
    FROM notification_preferences np
    WHERE np.user_email = appointment_record.email;
    
    -- Create reminder notification
    PERFORM create_notification(
      appointment_record.email,
      'Appointment Reminder',
      'You have an appointment for ' || appointment_record.service_type || 
      ' tomorrow (' || appointment_record.date || ') at ' || appointment_record.time || 
      '. Please arrive 15 minutes early.',
      'info',
      'reminder',
      appointment_record.id,
      jsonb_build_object(
        'reminder_hours_before', reminder_hours,
        'appointment_date', appointment_record.date,
        'appointment_time', appointment_record.time
      )
    );
    
    reminder_count := reminder_count + 1;
  END LOOP;
  
  RETURN reminder_count;
END;
$$;

-- Insert default email templates
INSERT INTO email_templates (name, subject, body_html, body_text, variables) VALUES
(
  'appointment_confirmation',
  'Appointment Confirmed - {{appointment_date}} at {{appointment_time}}',
  '<h2>Appointment Confirmed</h2><p>Dear {{patient_name}},</p><p>Your appointment has been confirmed:</p><ul><li><strong>Service:</strong> {{service_type}}</li><li><strong>Date:</strong> {{appointment_date}}</li><li><strong>Time:</strong> {{appointment_time}}</li></ul><p>Please arrive 15 minutes early.</p><p>Best regards,<br>Dr. Gürkan Eryanılmaz</p>',
  'Appointment Confirmed\n\nDear {{patient_name}},\n\nYour appointment has been confirmed:\n\nService: {{service_type}}\nDate: {{appointment_date}}\nTime: {{appointment_time}}\n\nPlease arrive 15 minutes early.\n\nBest regards,\nDr. Gürkan Eryanılmaz',
  '["patient_name", "service_type", "appointment_date", "appointment_time"]'::jsonb
),
(
  'appointment_reminder',
  'Appointment Reminder - Tomorrow at {{appointment_time}}',
  '<h2>Appointment Reminder</h2><p>Dear {{patient_name}},</p><p>This is a reminder that you have an appointment tomorrow:</p><ul><li><strong>Service:</strong> {{service_type}}</li><li><strong>Date:</strong> {{appointment_date}}</li><li><strong>Time:</strong> {{appointment_time}}</li></ul><p>Please arrive 15 minutes early.</p><p>Best regards,<br>Dr. Gürkan Eryanılmaz</p>',
  'Appointment Reminder\n\nDear {{patient_name}},\n\nThis is a reminder that you have an appointment tomorrow:\n\nService: {{service_type}}\nDate: {{appointment_date}}\nTime: {{appointment_time}}\n\nPlease arrive 15 minutes early.\n\nBest regards,\nDr. Gürkan Eryanılmaz',
  '["patient_name", "service_type", "appointment_date", "appointment_time"]'::jsonb
),
(
  'appointment_cancelled',
  'Appointment Cancelled - {{appointment_date}}',
  '<h2>Appointment Cancelled</h2><p>Dear {{patient_name}},</p><p>Your appointment has been cancelled:</p><ul><li><strong>Service:</strong> {{service_type}}</li><li><strong>Date:</strong> {{appointment_date}}</li><li><strong>Time:</strong> {{appointment_time}}</li></ul><p>If you would like to reschedule, please contact us.</p><p>Best regards,<br>Dr. Gürkan Eryanılmaz</p>',
  'Appointment Cancelled\n\nDear {{patient_name}},\n\nYour appointment has been cancelled:\n\nService: {{service_type}}\nDate: {{appointment_date}}\nTime: {{appointment_time}}\n\nIf you would like to reschedule, please contact us.\n\nBest regards,\nDr. Gürkan Eryanılmaz',
  '["patient_name", "service_type", "appointment_date", "appointment_time"]'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_notification(text, text, text, text, text, uuid, jsonb) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION mark_notification_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notifications_count(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION send_appointment_status_notification(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION send_appointment_reminders() TO authenticated;