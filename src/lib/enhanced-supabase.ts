import { supabase } from './supabase';
import { getAppointments, type Appointment } from './supabase';

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

export interface CalendarSlot {
  date: string;
  time: string;
  status: 'available' | 'booked' | 'blocked';
  appointment_id?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  service_type?: string;
  appointment_status?: string;
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

// Get enhanced calendar data with conflict detection and fallback mechanism
export const getEnhancedCalendarData = async (
  startDate: string,
  endDate: string
): Promise<CalendarSlot[]> => {
  try {
    // Try the enhanced RPC function first
    const { data, error } = await supabase.rpc('get_calendar_data_enhanced', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.warn('Enhanced calendar data function failed, falling back to basic appointments:', error);
    
    // Fallback: Use the basic getAppointments function
    try {
      const appointments = await getAppointments();
      
      // Filter appointments by date range and confirmed status
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      const filteredAppointments = appointments.filter((appointment: Appointment) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= startDateObj && 
               appointmentDate <= endDateObj && 
               appointment.status === 'confirmed';
      });

      // Map appointments to CalendarSlot format
      const calendarSlots: CalendarSlot[] = filteredAppointments.map((appointment: Appointment) => ({
        date: appointment.date,
        time: appointment.time,
        status: 'booked' as const,
        appointment_id: appointment.id,
        patient_name: appointment.name,
        patient_email: appointment.email,
        patient_phone: appointment.phone,
        service_type: appointment.service_type,
        appointment_status: appointment.status
      }));

      return calendarSlots;
    } catch (fallbackError) {
      console.error('Fallback calendar data loading also failed:', fallbackError);
      throw new Error('Failed to load calendar data');
    }
  }
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