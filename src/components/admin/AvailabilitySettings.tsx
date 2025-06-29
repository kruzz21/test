import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CalendarSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: string;
  is_active: boolean;
}

interface AvailabilityForm {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: string;
}

const AvailabilitySettings: React.FC = () => {
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState<AvailabilityForm>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration: '30 minutes'
  });

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const slotDurations = [
    '15 minutes',
    '30 minutes',
    '45 minutes',
    '60 minutes'
  ];

  const loadCalendarSlots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendar_slots')
        .select('*')
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setCalendarSlots(data || []);
    } catch (error) {
      console.error('Error loading calendar slots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarSlots();
  }, []);

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const { error } = await supabase.rpc('set_recurring_availability', {
        day_of_week_param: availabilityForm.day_of_week,
        start_time_param: availabilityForm.start_time,
        end_time_param: availabilityForm.end_time,
        slot_duration_param: availabilityForm.slot_duration
      });

      if (error) throw error;

      setShowAddForm(false);
      setAvailabilityForm({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: '30 minutes'
      });
      loadCalendarSlots();
    } catch (error) {
      console.error('Error adding availability:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (slotId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('calendar_slots')
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
        .eq('id', slotId);

      if (error) throw error;
      loadCalendarSlots();
    } catch (error) {
      console.error('Error toggling slot status:', error);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;

    try {
      const { error } = await supabase
        .from('calendar_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      loadCalendarSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getDayName = (dayOfWeek: number) => {
    return daysOfWeek.find(day => day.value === dayOfWeek)?.label || 'Unknown';
  };

  // Group slots by day of week
  const groupedSlots = calendarSlots.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = [];
    }
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {} as Record<number, CalendarSlot[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Settings className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Availability Settings</h2>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Availability
        </button>
      </div>

      {/* Current Availability */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading availability settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {daysOfWeek.map((day) => {
            const daySlots = groupedSlots[day.value] || [];
            
            return (
              <div key={day.value} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary-600" />
                  {day.label}
                </h3>
                
                {daySlots.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No availability set</p>
                ) : (
                  <div className="space-y-3">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-lg border ${
                          slot.is_active 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {slot.slot_duration} slots
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleActive(slot.id, slot.is_active)}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                slot.is_active
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {slot.is_active ? 'Active' : 'Inactive'}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Availability Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Availability</h3>
            
            <form onSubmit={handleAddAvailability} className="space-y-4">
              <div>
                <label className="form-label">Day of Week</label>
                <select
                  className="form-input"
                  value={availabilityForm.day_of_week}
                  onChange={(e) => setAvailabilityForm({
                    ...availabilityForm,
                    day_of_week: parseInt(e.target.value)
                  })}
                >
                  {daysOfWeek.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={availabilityForm.start_time}
                    onChange={(e) => setAvailabilityForm({
                      ...availabilityForm,
                      start_time: e.target.value
                    })}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={availabilityForm.end_time}
                    onChange={(e) => setAvailabilityForm({
                      ...availabilityForm,
                      end_time: e.target.value
                    })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">Slot Duration</label>
                <select
                  className="form-input"
                  value={availabilityForm.slot_duration}
                  onChange={(e) => setAvailabilityForm({
                    ...availabilityForm,
                    slot_duration: e.target.value
                  })}
                >
                  {slotDurations.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary flex-1 flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Set recurring availability patterns for each day of the week</li>
          <li>• Choose slot duration (15, 30, 45, or 60 minutes)</li>
          <li>• Toggle availability on/off without deleting the pattern</li>
          <li>• Changes apply to future appointments automatically</li>
          <li>• Existing appointments are not affected by availability changes</li>
        </ul>
      </div>
    </div>
  );
};

export default AvailabilitySettings;