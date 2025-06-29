import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, User, Phone, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CalendarSlot {
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

interface AppointmentFormData {
  name: string;
  email: string;
  phone: string;
  service_type: string;
  message?: string;
}

const AppointmentManagement: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormData>({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    message: ''
  });
  const [blockReason, setBlockReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const serviceTypes = [
    'Knee Consultation',
    'Hip Consultation',
    'Shoulder Consultation',
    'Pediatric Consultation',
    'General Orthopedic Consultation',
    'Sports Injury Consultation',
    'Follow-up Appointment'
  ];

  // Get start and end dates for current week
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // End of week (Saturday)
    return { start, end };
  };

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { start, end } = getWeekDates(currentDate);
      
      const { data, error } = await supabase.rpc('get_calendar_data', {
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0]
      });

      if (error) throw error;
      setCalendarData(data || []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const handleSlotClick = (slot: CalendarSlot) => {
    setSelectedSlot(slot);
    if (slot.status === 'available') {
      setShowAppointmentForm(true);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    try {
      setError(null);
      const { error } = await supabase.from('appointments').insert({
        name: appointmentForm.name,
        email: appointmentForm.email,
        phone: appointmentForm.phone,
        date: selectedSlot.date,
        time: selectedSlot.time,
        service_type: appointmentForm.service_type,
        message: appointmentForm.message,
        status: 'confirmed'
      });

      if (error) throw error;

      setShowAppointmentForm(false);
      setAppointmentForm({
        name: '',
        email: '',
        phone: '',
        service_type: '',
        message: ''
      });
      setSelectedSlot(null);
      loadCalendarData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError('Failed to create appointment');
    }
  };

  const handleBlockSlot = async () => {
    if (!selectedSlot) return;

    try {
      setError(null);
      const { data, error } = await supabase.rpc('block_time_slots', {
        block_date: selectedSlot.date,
        start_time_param: selectedSlot.time,
        end_time_param: addMinutes(selectedSlot.time, 30),
        reason_param: blockReason
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.message);
      }

      setShowBlockForm(false);
      setBlockReason('');
      setSelectedSlot(null);
      loadCalendarData();
    } catch (error) {
      console.error('Error blocking slot:', error);
      setError('Failed to block slot');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
      loadCalendarData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Failed to delete appointment');
    }
  };

  const addMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'booked':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'blocked':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'blocked':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100';
    }
  };

  // Group slots by date
  const groupedSlots = calendarData.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, CalendarSlot[]>);

  const { start: weekStart, end: weekEnd } = getWeekDates(currentDate);
  const weekDates = [];
  for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
    weekDates.push(new Date(d));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Appointment Management</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
            className="btn btn-outline"
          >
            Previous Week
          </button>
          <span className="text-lg font-medium">
            {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
          </span>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
            className="btn btn-outline"
          >
            Next Week
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">Error</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading calendar...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-7 gap-0">
            {/* Day Headers */}
            {weekDates.map((date, index) => (
              <div key={index} className="bg-gray-50 p-4 text-center border-b border-gray-200">
                <div className="font-semibold text-gray-900">{formatDate(date.toISOString().split('T')[0])}</div>
                <div className="text-sm text-gray-500">{date.toLocaleDateString('en-US', { weekday: 'long' })}</div>
              </div>
            ))}

            {/* Time Slots */}
            {weekDates.map((date, dayIndex) => {
              const dateString = date.toISOString().split('T')[0];
              const daySlots = groupedSlots[dateString] || [];
              
              return (
                <div key={dayIndex} className="border-r border-gray-200 last:border-r-0 min-h-96">
                  <div className="space-y-1 p-2">
                    {daySlots.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Clock className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm">No slots</p>
                      </div>
                    ) : (
                      daySlots.map((slot, slotIndex) => (
                        <div
                          key={slotIndex}
                          onClick={() => handleSlotClick(slot)}
                          className={`p-2 rounded border cursor-pointer transition-colors ${getStatusColor(slot.status)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{formatTime(slot.time)}</span>
                            {getStatusIcon(slot.status)}
                          </div>
                          
                          {slot.status === 'booked' && (
                            <div className="mt-1">
                              <p className="text-xs font-medium truncate">{slot.patient_name}</p>
                              <p className="text-xs text-gray-600 truncate">{slot.service_type}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs px-1 py-0.5 rounded ${
                                  slot.appointment_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  slot.appointment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {slot.appointment_status}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (slot.appointment_id) {
                                      handleDeleteAppointment(slot.appointment_id);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Appointment Form Modal */}
      {showAppointmentForm && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Add Appointment - {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.time)}
            </h3>
            
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="form-label">Patient Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={appointmentForm.name}
                  onChange={(e) => setAppointmentForm({...appointmentForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={appointmentForm.email}
                  onChange={(e) => setAppointmentForm({...appointmentForm, email: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={appointmentForm.phone}
                  onChange={(e) => setAppointmentForm({...appointmentForm, phone: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Service Type</label>
                <select
                  className="form-input"
                  value={appointmentForm.service_type}
                  onChange={(e) => setAppointmentForm({...appointmentForm, service_type: e.target.value})}
                  required
                >
                  <option value="">Select a service</option>
                  {serviceTypes.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Message (Optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={appointmentForm.message}
                  onChange={(e) => setAppointmentForm({...appointmentForm, message: e.target.value})}
                />
              </div>
              
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1">
                  Add Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAppointmentForm(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Slot Modal */}
      {showBlockForm && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Block Time Slot - {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.time)}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Reason (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g., Doctor unavailable, maintenance"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleBlockSlot}
                  className="btn btn-primary flex-1"
                >
                  Block Slot
                </button>
                <button
                  onClick={() => setShowBlockForm(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="text-lg font-semibold mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-2"></div>
            <span className="text-sm">Available (Click to add appointment)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
            <span className="text-sm">Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
            <span className="text-sm">Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManagement;