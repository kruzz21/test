import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_anon_key';

// Create a mock client if environment variables are not properly configured
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

// Mock functions for frontend-only operation
export const createAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
  // Mock implementation for frontend-only operation
  console.warn('Supabase not configured - using mock data');
  return {
    id: Math.random().toString(36).substr(2, 9),
    ...data,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const getAppointments = async (): Promise<Appointment[]> => {
  console.warn('Supabase not configured - returning empty array');
  return [];
};

export const getAppointmentStats = async (): Promise<AppointmentStats> => {
  console.warn('Supabase not configured - returning mock stats');
  return {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  };
};

export const updateAppointmentStatus = async (
  id: string, 
  status: Appointment['status']
): Promise<Appointment> => {
  console.warn('Supabase not configured - using mock update');
  return {
    id,
    name: 'Mock Patient',
    email: 'mock@example.com',
    phone: '+1234567890',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    service_type: 'Mock Service',
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const deleteAppointment = async (id: string): Promise<void> => {
  console.warn('Supabase not configured - mock delete operation');
  return;
};

export const searchAppointments = async (
  patientName: string,
  patientPhone: string
): Promise<Appointment[]> => {
  console.warn('Supabase not configured - returning empty search results');
  return [];
};

export const getAvailableSlots = async (date: string): Promise<AppointmentSlot[]> => {
  console.warn('Supabase not configured - returning mock slots');
  // Generate mock time slots for the date
  const slots: AppointmentSlot[] = [];
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  
  times.forEach((time, index) => {
    slots.push({
      id: `mock-${index}`,
      date,
      time,
      available: true,
      created_at: new Date().toISOString(),
    });
  });
  
  return slots;
};

export const createAppointmentSlot = async (
  date: string, 
  time: string
): Promise<AppointmentSlot> => {
  console.warn('Supabase not configured - using mock slot creation');
  return {
    id: Math.random().toString(36).substr(2, 9),
    date,
    time,
    available: true,
    created_at: new Date().toISOString(),
  };
};

export const updateSlotAvailability = async (
  id: string, 
  available: boolean
): Promise<AppointmentSlot> => {
  console.warn('Supabase not configured - using mock slot update');
  return {
    id,
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    available,
    created_at: new Date().toISOString(),
  };
};