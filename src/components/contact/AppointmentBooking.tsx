import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createAppointment, CreateAppointmentData } from '../../lib/supabase';

interface FormData extends CreateAppointmentData {}

const AppointmentBooking = () => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>();

  const serviceTypes = [
    'Knee Consultation',
    'Hip Consultation', 
    'Shoulder Consultation',
    'Pediatric Consultation',
    'General Orthopedic Consultation',
    'Sports Injury Consultation',
    'Follow-up Appointment'
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitError(null);
      
      await createAppointment(data);
      setIsSubmitted(true);
      reset();
      
    } catch (error) {
      console.error('Appointment booking error:', error);
      setSubmitError('Failed to book appointment. Please try again or contact us directly.');
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="patient_name" className="form-label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="patient_name"
              type="text"
              className={`form-input ${errors.patient_name ? 'border-red-500' : ''}`}
              {...register('patient_name', { required: 'Full name is required' })}
            />
            {errors.patient_name && (
              <p className="mt-1 text-sm text-red-500">{errors.patient_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="patient_email" className="form-label">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="patient_email"
              type="email"
              className={`form-input ${errors.patient_email ? 'border-red-500' : ''}`}
              {...register('patient_email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
            />
            {errors.patient_email && (
              <p className="mt-1 text-sm text-red-500">{errors.patient_email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="patient_phone" className="form-label">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="patient_phone"
            type="tel"
            placeholder="+994 55 397 78 74"
            className={`form-input ${errors.patient_phone ? 'border-red-500' : ''}`}
            {...register('patient_phone', {
              required: 'Phone number is required',
              minLength: {
                value: 10,
                message: 'Phone number must be at least 10 digits'
              }
            })}
          />
          {errors.patient_phone && (
            <p className="mt-1 text-sm text-red-500">{errors.patient_phone.message}</p>
          )}
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="appointment_date" className="form-label">
              <Calendar size={16} className="inline mr-2" />
              Preferred Date <span className="text-red-500">*</span>
            </label>
            <input
              id="appointment_date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className={`form-input ${errors.appointment_date ? 'border-red-500' : ''}`}
              {...register('appointment_date', { required: 'Please select a date' })}
            />
            {errors.appointment_date && (
              <p className="mt-1 text-sm text-red-500">{errors.appointment_date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="appointment_time" className="form-label">
              <Clock size={16} className="inline mr-2" />
              Preferred Time <span className="text-red-500">*</span>
            </label>
            <select
              id="appointment_time"
              className={`form-input ${errors.appointment_time ? 'border-red-500' : ''}`}
              {...register('appointment_time', { required: 'Please select a time' })}
            >
              <option value="">Select time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.appointment_time && (
              <p className="mt-1 text-sm text-red-500">{errors.appointment_time.message}</p>
            )}
          </div>
        </div>

        <div>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a request for an appointment. We will contact you within 24 hours to confirm your appointment time and provide any additional instructions.
          </p>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
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