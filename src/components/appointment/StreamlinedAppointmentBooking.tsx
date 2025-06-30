import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, CheckCircle2, AlertCircle, Search, User, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createAppointment, CreateAppointmentData } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';

interface FormData extends CreateAppointmentData {}

interface TimeSlot {
  id: string;
  slot_time: string;
  available: boolean;
  created_at: string;
}

const StreamlinedAppointmentBooking = () => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<FormData>();

  const watchedDate = watch('date');

  const serviceTypes = [
    { key: 'kneeConsultation', value: 'Knee Consultation' },
    { key: 'hipConsultation', value: 'Hip Consultation' },
    { key: 'shoulderConsultation', value: 'Shoulder Consultation' },
    { key: 'pediatricConsultation', value: 'Pediatric Consultation' },
    { key: 'generalConsultation', value: 'General Orthopedic Consultation' },
    { key: 'sportsConsultation', value: 'Sports Injury Consultation' },
    { key: 'followUp', value: 'Follow-up Appointment' }
  ];

  // Load available slots when date changes
  useEffect(() => {
    if (watchedDate && watchedDate !== selectedDate) {
      setSelectedDate(watchedDate);
      setSelectedTime('');
      setValue('time', '');
      loadAvailableSlots(watchedDate);
    }
  }, [watchedDate, selectedDate, setValue]);

  const loadAvailableSlots = async (date: string) => {
    try {
      setLoadingSlots(true);
      
      // Use the new function that returns all slots (available and unavailable)
      const { data, error } = await supabase.rpc('get_all_slots_for_date', {
        target_date: date
      });

      if (error) {
        console.error('Error loading slots:', error);
        // Fallback to the original function if the new one fails
        const { data: fallbackData, error: fallbackError } = await supabase.rpc('get_available_slots_enhanced', {
          target_date: date
        });
        
        if (fallbackError) throw fallbackError;
        setAvailableSlots(fallbackData || []);
      } else {
        setAvailableSlots(data || []);
      }
    } catch (error) {
      console.error('Failed to load available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitError(null);
      
      // Create appointment with pending status for admin approval
      await createAppointment({
        ...data,
        // Note: status will be set to 'pending' by default in the database
      });
      
      setIsSubmitted(true);
      reset();
      setAvailableSlots([]);
      setSelectedDate('');
      setSelectedTime('');
      
    } catch (error) {
      console.error('Appointment booking error:', error);
      setSubmitError(error instanceof Error ? error.message : t('appointment.form.validation.submitError'));
    }
  };

  const handleTimeSelection = (time: string) => {
    setSelectedTime(time);
    setValue('time', time);
  };

  const formatTime = (timeString: string) => {
    try {
      // Handle different time formats
      if (!timeString) return '';
      
      // If it's already in HH:MM format, return as is
      if (/^\d{2}:\d{2}$/.test(timeString)) {
        return timeString;
      }
      
      // If it's in HH:MM:SS format, extract HH:MM
      if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
        return timeString.substring(0, 5);
      }
      
      // Try to parse as a time and format
      const date = new Date(`2000-01-01T${timeString}`);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      
      // If all else fails, return the original string
      return timeString;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString || '';
    }
  };

  const isTimeSlotDisabled = (date: string, time: string, available: boolean) => {
    if (!available) return true;
    
    const slotDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const minAdvanceTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours minimum advance booking
    
    return slotDateTime < minAdvanceTime;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-green-800 mb-2">
          {t('appointment.success.title')}
        </h3>
        <p className="text-green-700 mb-6">
          {t('appointment.success.message')}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => setIsSubmitted(false)}
            className="btn btn-outline text-green-600 border-green-600 hover:bg-green-50 mr-4"
          >
            {t('appointment.success.bookAnother')}
          </button>
          <Link
            to="/appointments"
            className="btn btn-primary inline-flex items-center"
          >
            <Search size={16} className="mr-2" />
            {t('appointment.success.checkAppointments')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('appointment.title')}</h2>
        <p className="text-gray-600">{t('appointment.subtitle')}</p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">{t('contact.form.error.title')}</h4>
            <p className="text-red-700 text-sm mt-1">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User size={20} className="mr-2 text-primary-600" />
            {t('appointment.form.personalInfo')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="form-label">
                {t('appointment.form.name')} <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                {...register('name', { required: t('appointment.form.validation.nameRequired') })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                <Mail size={16} className="inline mr-1" />
                {t('appointment.form.email')} <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                {...register('email', {
                  required: t('appointment.form.validation.emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('appointment.form.validation.emailInvalid')
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="phone" className="form-label">
              <Phone size={16} className="inline mr-1" />
              {t('appointment.form.phone')} <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+994553977874"
              className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
              {...register('phone', {
                required: t('appointment.form.validation.phoneRequired'),
                pattern: {
                  value: /^\+?[0-9]{10,15}$/,
                  message: t('appointment.form.validation.phoneInvalid')
                }
              })}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar size={20} className="mr-2 text-primary-600" />
            {t('appointment.form.appointmentDetails')}
          </h3>

          <div>
            <label htmlFor="service_type" className="form-label">
              {t('appointment.form.serviceType')} <span className="text-red-500">*</span>
            </label>
            <select
              id="service_type"
              className={`form-input ${errors.service_type ? 'border-red-500' : ''}`}
              {...register('service_type', { required: t('appointment.form.validation.serviceRequired') })}
            >
              <option value="">{t('appointment.form.selectService')}</option>
              {serviceTypes.map((service) => (
                <option key={service.value} value={service.value}>
                  {t(`appointment.serviceTypes.${service.key}`)}
                </option>
              ))}
            </select>
            {errors.service_type && (
              <p className="mt-1 text-sm text-red-500">{errors.service_type.message}</p>
            )}
          </div>

          <div className="mt-6">
            <label htmlFor="date" className="form-label">
              <Calendar size={16} className="inline mr-2" />
              {t('appointment.form.preferredDate')} <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              type="date"
              min={getMinDate()}
              className={`form-input ${errors.date ? 'border-red-500' : ''}`}
              {...register('date', { required: t('appointment.form.validation.dateRequired') })}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Available Time Slots */}
          {selectedDate && (
            <div className="mt-6">
              <label className="form-label">
                <Clock size={16} className="inline mr-2" />
                {t('appointment.form.availableTimeSlots')} <span className="text-red-500">*</span>
              </label>
              
              {loadingSlots ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">{t('appointment.form.loadingSlots')}</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                  {availableSlots.map((slot) => {
                    const isDisabled = isTimeSlotDisabled(selectedDate, slot.slot_time, slot.available);
                    const isSelected = selectedTime === slot.slot_time;
                    const isUnavailable = !slot.available;
                    
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => !isDisabled && !isUnavailable && handleTimeSelection(slot.slot_time)}
                        disabled={isDisabled || isUnavailable}
                        className={`p-3 border rounded-md text-sm font-medium transition-all duration-200 ${
                          isUnavailable
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isDisabled
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isSelected
                            ? 'border-blue-500 bg-blue-500 text-white shadow-md transform scale-105'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                        }`}
                        title={isUnavailable ? 'This time slot is not available' : isDisabled ? 'This time slot is too soon' : 'Click to select this time'}
                      >
                        {formatTime(slot.slot_time)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>{t('appointment.form.noSlotsAvailable')}</p>
                  <p className="text-sm">{t('appointment.form.selectDifferentDate')}</p>
                </div>
              )}
              
              {errors.time && (
                <p className="mt-1 text-sm text-red-500">{errors.time.message}</p>
              )}
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="message" className="form-label">
              {t('appointment.form.additionalMessage')}
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder={t('appointment.form.symptomDescription')}
              className="form-input"
              {...register('message')}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>{t('appointment.form.validation.note')}:</strong> {t('appointment.form.note')}
          </p>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting || !selectedDate || !selectedTime || availableSlots.length === 0}
        >
          {isSubmitting ? t('appointment.form.submitting') : t('appointment.form.submit')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/appointments"
          className="text-primary-600 hover:text-primary-700 inline-flex items-center text-sm"
        >
          <Search size={16} className="mr-1" />
          {t('appointment.success.checkAppointments')}
        </Link>
      </div>
    </div>
  );
};

export default StreamlinedAppointmentBooking;