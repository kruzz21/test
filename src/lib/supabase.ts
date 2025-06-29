import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  is_available: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  message?: string;
}

// Appointment functions
export const createAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return appointment;
};

export const getAppointments = async (): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const updateAppointmentStatus = async (
  id: string, 
  status: Appointment['status']
): Promise<Appointment> => {
  // First check if the appointment exists
  const { data: existingAppointment, error: checkError } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Failed to check appointment: ${checkError.message}`);
  }

  if (!existingAppointment) {
    throw new Error('Appointment not found or may have been deleted');
  }

  // Now perform the update
  const { data, error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update appointment: ${error.message}`);
  }

  if (!data) {
    throw new Error('Appointment not found or may have been deleted');
  }

  return data;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete appointment: ${error.message}`);
  }
};

export const searchAppointments = async (
  patientName: string,
  patientPhone: string
): Promise<Appointment[]> => {
  // Clean phone number for comparison (remove spaces, dashes, parentheses)
  const cleanPhone = patientPhone.replace(/[\s\-\(\)]/g, '');
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .ilike('patient_name', `%${patientName}%`)
    .or(`patient_phone.like.%${cleanPhone.slice(-10)},patient_phone.like.%${cleanPhone}%`)
    .order('appointment_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Appointment slots functions
export const getAvailableSlots = async (date: string): Promise<AppointmentSlot[]> => {
  const { data, error } = await supabase
    .from('appointment_slots')
    .select('*')
    .eq('date', date)
    .eq('is_available', true)
    .order('time', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const createAppointmentSlot = async (
  date: string, 
  time: string
): Promise<AppointmentSlot> => {
  const { data, error } = await supabase
    .from('appointment_slots')
    .insert([{ date, time }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateSlotAvailability = async (
  id: string, 
  isAvailable: boolean
): Promise<AppointmentSlot> => {
  const { data, error } = await supabase
    .from('appointment_slots')
    .update({ is_available: isAvailable })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};