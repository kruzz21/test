import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, CheckCircle2, AlertCircle, Search, User, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createAppointment, getAvailableSlots, CreateAppointmentData, AppointmentSlot } from '../../lib/supabase';

interface FormData extends CreateAppointmentData {}

const AppointmentBooking = () => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
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
    'Knee Consultation',
    'Hip Consultation', 
    'Shoulder Consultation',
    'Pediatric Consultation',
    'General Orthopedic Consultation',
    'Sports Injury Consultation',
    'Follow-up Appointment'
  ];

  // Load available slots when date changes
  useEffect(() => {
    if (watchedDate && watchedDate !== selectedDate) {
      setSelectedDate(watchedDate);
      loadAvailableSlots(watchedDate);
    }
  }, [watchedDate, selectedDate]);

  const loadAvailableSlots = async (date: string) => {
    try {
      setLoadingSlots(true);
      const slots = await getAvailableSlots(date);
      setAvailableSlots(slots);
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
      
      await createAppointment(data);
      setIsSubmitted(true);
      reset();
      setAvailableSlots([]);
      setSelectedDate('');
      
    } catch (error) {
      console.error('Appointment booking error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to book appointment. Please try again or contact us directly.');
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-green-800 mb-2">
          Appointment Booked Successfully!
        </h3>
        <p className="text-green-700 mb-6">
          We have received your appointment request. We will contact you shortly to confirm the details.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => setIsSubmitted(false)}
            className="btn btn-outline text-green-600 border-green-600 hover:bg-green-50 mr-4"
          >
            Book Another Appointment
          </button>
          <Link
            to="/appointments"
            className="btn btn-primary inline-flex items-center"
          >
            <Search size={16} className="mr-2" />
            Check Your Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Book an Appointment</h2>
        <p className="text-gray-600">Schedule your consultation with Dr. Gürkan Eryanılmaz</p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">Booking Failed</h4>
            <p className="text-red-700 text-sm mt-1">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User size={20} className="mr-2 text-primary-600" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="form-label">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                {...register('name', { required: 'Full name is required' })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                <Mail size={16} className="inline mr-1" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
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
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+994553977874"
              className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^\+?[0-9]{10,15}$/,
                  message: 'Please enter a valid phone number (10-15 digits)'
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
            Appointment Details
          </h3>

          <div>
            <label htmlFor="service_type" className="form-label">
              Service Type <span className="text-red-500">*</span>
            </label>
            <select
              id="service_type"
              className={`form-input ${errors.service_type ? 'border-red-500' : ''}`}
              {...register('service_type', { required: 'Please select a service type' })}
            >
              <option value="">Select a service</option>
              {serviceTypes.map((service) => (
                <option key={service} value={service}>
                  {service}
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
              Preferred Date <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className={`form-input ${errors.date ? 'border-red-500' : ''}`}
              {...register('date', { required: 'Please select a date' })}
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
                Available Time Slots <span className="text-red-500">*</span>
              </label>
              
              {loadingSlots ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading available slots...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                  {availableSlots.map((slot) => (
                    <label
                      key={slot.id}
                      className="flex items-center justify-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-colors"
                    >
                      <input
                        type="radio"
                        value={slot.time}
                        className="sr-only"
                        {...register('time', { required: 'Please select a time' })}
                      />
                      <span className="text-sm font-medium">
                        {formatTime(slot.time)}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No available slots for this date</p>
                  <p className="text-sm">Please select a different date</p>
                </div>
              )}
              
              {errors.time && (
                <p className="mt-1 text-sm text-red-500">{errors.time.message}</p>
              )}
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="message" className="form-label">
              Additional Message
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder="Please describe your symptoms or concerns..."
              className="form-input"
              {...register('message')}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a request for an appointment. We will contact you within 24 hours to confirm your appointment time and provide any additional instructions.
          </p>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting || !selectedDate || availableSlots.length === 0}
        >
          {isSubmitting ? 'Booking Appointment...' : 'Book Appointment'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/appointments"
          className="text-primary-600 hover:text-primary-700 inline-flex items-center text-sm"
        >
          <Search size={16} className="mr-1" />
          Check Your Existing Appointments
        </Link>
      </div>
    </div>
  );
};

export default AppointmentBooking;