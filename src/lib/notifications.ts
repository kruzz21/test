import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_email: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'appointment' | 'system' | 'reminder' | 'admin';
  read: boolean;
  appointment_id?: string;
  metadata?: any;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  id: string;
  user_email: string;
  email_notifications: boolean;
  appointment_reminders: boolean;
  status_updates: boolean;
  marketing_emails: boolean;
  reminder_hours_before: number;
  created_at: string;
  updated_at: string;
}

// Get notifications for a user
export const getNotifications = async (userEmail: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userEmail: string): Promise<number> => {
  const { data, error } = await supabase.rpc('get_unread_notifications_count', {
    user_email_param: userEmail
  });

  if (error) {
    throw new Error(error.message);
  }

  return data || 0;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('mark_notification_read', {
    notification_id_param: notificationId
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Create a new notification
export const createNotification = async (
  userEmail: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  category: Notification['category'] = 'system',
  appointmentId?: string,
  metadata?: any
): Promise<string> => {
  const { data, error } = await supabase.rpc('create_notification', {
    user_email_param: userEmail,
    title_param: title,
    message_param: message,
    type_param: type,
    category_param: category,
    appointment_id_param: appointmentId,
    metadata_param: metadata
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Get notification preferences for a user
export const getNotificationPreferences = async (userEmail: string): Promise<NotificationPreferences | null> => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_email', userEmail)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error(error.message);
  }

  return data;
};

// Update notification preferences
export const updateNotificationPreferences = async (
  userEmail: string,
  preferences: Partial<Omit<NotificationPreferences, 'id' | 'user_email' | 'created_at' | 'updated_at'>>
): Promise<NotificationPreferences> => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_email: userEmail,
      ...preferences,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Send appointment status notification
export const sendAppointmentStatusNotification = async (
  appointmentId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> => {
  const { error } = await supabase.rpc('send_appointment_status_notification', {
    appointment_id_param: appointmentId,
    old_status: oldStatus,
    new_status: newStatus
  });

  if (error) {
    throw new Error(error.message);
  }
};

// Send appointment reminders (typically called by a scheduled job)
export const sendAppointmentReminders = async (): Promise<number> => {
  const { data, error } = await supabase.rpc('send_appointment_reminders');

  if (error) {
    throw new Error(error.message);
  }

  return data || 0;
};