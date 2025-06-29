import { supabase } from './supabase';

// Enhanced appointment functions using the new database improvements

export interface PatientSearchResult {
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_id: string;
  last_appointment_date: string;
  total_appointments: number;
  last_service_type: string;
}

export interface AppointmentHistory {
  appointment_id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
  message?: string;
  created_at: string;
}

export interface UpcomingAppointment {
  appointment_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
  days_until_appointment: number;
}

export interface AppointmentConflict {
  conflict_appointment_id: string;
  conflict_patient_name: string;
  conflict_status: string;
}

export interface DetailedStats {
  overall: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  today: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  this_week: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  this_month: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
}

// Get detailed appointment statistics
export const getDetailedAppointmentStats = async (): Promise<DetailedStats> => {
  const { data, error } = await supabase.rpc('get_appointment_stats_detailed');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Search patients
export const searchPatients = async (
  searchTerm: string,
  limit: number = 50
): Promise<PatientSearchResult[]> => {
  const { data, error } = await supabase.rpc('search_patients', {
    search_term: searchTerm,
    limit_count: limit
  });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Get patient appointment history
export const getPatientHistory = async (
  patientEmail: string,
  patientPhone: string
): Promise<AppointmentHistory[]> => {
  const { data, error } = await supabase.rpc('get_patient_history', {
    patient_email_param: patientEmail,
    patient_phone_param: patientPhone
  });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Create appointment with enhanced features
export const createAppointmentEnhanced = async (appointmentData: {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service_type: string;
  message?: string;
}): Promise<{ appointment_id: string; patient_id: string }> => {
  const { data, error } = await supabase.rpc('create_appointment_enhanced', {
    name_param: appointmentData.name,
    email_param: appointmentData.email,
    phone_param: appointmentData.phone,
    date_param: appointmentData.date,
    time_param: appointmentData.time,
    service_type_param: appointmentData.service_type,
    message_param: appointmentData.message
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.success) {
    throw new Error(data.message);
  }

  return {
    appointment_id: data.appointment_id,
    patient_id: data.patient_id
  };
};

// Get upcoming appointments
export const getUpcomingAppointments = async (
  daysAhead: number = 7
): Promise<UpcomingAppointment[]> => {
  const { data, error } = await supabase.rpc('get_upcoming_appointments', {
    days_ahead: daysAhead
  });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Check for appointment conflicts
export const checkAppointmentConflicts = async (
  date: string,
  time: string,
  excludeAppointmentId?: string
): Promise<AppointmentConflict[]> => {
  const { data, error } = await supabase.rpc('check_appointment_conflicts', {
    check_date: date,
    check_time: time,
    exclude_appointment_id: excludeAppointmentId
  });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Get enhanced calendar data with conflict detection
export const getEnhancedCalendarData = async (
  startDate: string,
  endDate: string
) => {
  const { data, error } = await supabase.rpc('get_calendar_data_enhanced', {
    start_date: startDate,
    end_date: endDate
  });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Generate patient ID
export const generatePatientId = async (): Promise<string> => {
  const { data, error } = await supabase.rpc('generate_patient_id');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Run automated cleanup
export const runAutomatedCleanup = async (): Promise<void> => {
  const { error } = await supabase.rpc('automated_cleanup');

  if (error) {
    throw new Error(error.message);
  }
};