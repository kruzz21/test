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
  available: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service_type: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  patient_id?: string;
}

export interface CreateAppointmentData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service_type: string;
  message?: string;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
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
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getAppointmentStats = async (): Promise<AppointmentStats> => {
  try {
    const { data, error } = await supabase.rpc('get_appointment_stats');
    
    if (error) {
      throw error;
    }
    
    return data as AppointmentStats;
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    // Fallback to manual calculation
    const appointments = await getAppointments();
    return {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
    };
  }
};

export const updateAppointmentStatus = async (
  id: string, 
  status: Appointment['status']
): Promise<Appointment> => {
  try {
    const { data, error } = await supabase.rpc('update_appointment_status_safe', {
      appointment_id: id,
      new_status: status
    });

    if (error) {
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to update appointment');
    }

    return data.appointment as Appointment;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update appointment status');
  }
};

export const deleteAppointment = async (id: string): Promise<void> => {
  try {
    const { data, error } = await supabase.rpc('delete_appointment_safe', {
      appointment_id: id
    });

    if (error) {
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete appointment');
    }
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete appointment');
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
    .ilike('name', `%${patientName}%`)
    .or(`phone.like.%${cleanPhone.slice(-10)},phone.like.%${cleanPhone}%`)
    .order('date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Enhanced appointment slots functions using the new calendar system
export const getAvailableSlots = async (date: string): Promise<AppointmentSlot[]> => {
  try {
    const { data, error } = await supabase.rpc('get_available_slots_enhanced', {
      target_date: date
    });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching available slots:', error);
    // Fallback to old method if new function fails
    const { data, error: fallbackError } = await supabase
      .from('appointment_slots')
      .select('*')
      .eq('date', date)
      .eq('available', true)
      .order('time', { ascending: true });

    if (fallbackError) {
      throw new Error(fallbackError.message);
    }

    return data || [];
  }
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
  available: boolean
): Promise<AppointmentSlot> => {
  const { data, error } = await supabase
    .from('appointment_slots')
    .update({ available })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};