import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Search, Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { searchAppointments, deleteAppointment, Appointment } from '../lib/supabase';

interface SearchForm {
  patientName: string;
  patientPhone: string;
}

const CheckAppointmentsPage = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SearchForm>();

  const onSubmit = async (data: SearchForm) => {
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(false);

    try {
      const results = await searchAppointments(data.patientName, data.patientPhone);
      setAppointments(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to search appointments. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      setSearchError(null);
      await deleteAppointment(id);
      // Remove from local state immediately
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setSearchError(`Failed to delete appointment: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatPhone = (phone: string) => {
    // Format phone number for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/);
      if (match) {
        return `+${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
      }
    }
    return phone;
  };

  return (
    <>
      <Helmet>
        <title>Check Your Appointments | {t('meta.title')}</title>
      </Helmet>

      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-600 text-white">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Check Your Appointments</h1>
          <p className="text-xl text-primary-100">Find and view your scheduled appointments</p>
        </div>
      </div>

      {/* Search Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Your Appointments</h2>
                <p className="text-gray-600">Enter your details to search for your appointments</p>
              </div>

              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start mb-6">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-800 font-medium">Error</h4>
                    <p className="text-red-700 text-sm mt-1">{searchError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="patientName" className="form-label">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="patientName"
                      type="text"
                      placeholder="Enter your full name as used when booking"
                      className={`form-input pl-10 ${errors.patientName ? 'border-red-500' : ''}`}
                      {...register('patientName', { 
                        required: 'Full name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        }
                      })}
                    />
                  </div>
                  {errors.patientName && (
                    <p className="mt-1 text-sm text-red-500">{errors.patientName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="patientPhone" className="form-label">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="patientPhone"
                      type="tel"
                      placeholder="Enter your phone number as used when booking"
                      className={`form-input pl-10 ${errors.patientPhone ? 'border-red-500' : ''}`}
                      {...register('patientPhone', { 
                        required: 'Phone number is required',
                        minLength: {
                          value: 10,
                          message: 'Phone number must be at least 10 digits'
                        }
                      })}
                    />
                  </div>
                  {errors.patientPhone && (
                    <p className="mt-1 text-sm text-red-500">{errors.patientPhone.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the phone number exactly as you provided when booking your appointment
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full btn btn-primary flex items-center justify-center space-x-2"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      <span>Search Appointments</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {hasSearched && (
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Appointments</h2>
              
              {appointments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No appointments found</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any appointments with the provided information.
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• Make sure you entered your name exactly as when booking</p>
                    <p>• Check that your phone number matches the one used for booking</p>
                    <p>• Contact us if you need assistance finding your appointment</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(appointment.status)}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right text-sm text-gray-500">
                              Booked on {formatDate(appointment.created_at)}
                            </div>
                            {appointment.status === 'pending' && (
                              deleteConfirm === appointment.id ? (
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleDeleteAppointment(appointment.id)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded text-xs bg-red-50"
                                    title="Confirm Delete"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="text-gray-600 hover:text-gray-900 p-1 rounded text-xs bg-gray-50"
                                    title="Cancel Delete"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(appointment.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Cancel Appointment"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                            <div className="space-y-3">
                              <div className="flex items-center">
                                <User size={16} className="text-gray-400 mr-3" />
                                <span className="text-gray-700">{appointment.name}</span>
                              </div>
                              <div className="flex items-center">
                                <Mail size={16} className="text-gray-400 mr-3" />
                                <span className="text-gray-700">{appointment.email}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone size={16} className="text-gray-400 mr-3" />
                                <span className="text-gray-700">{formatPhone(appointment.phone)}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
                            <div className="space-y-3">
                              <div className="flex items-center">
                                <Calendar size={16} className="text-gray-400 mr-3" />
                                <span className="text-gray-700">{formatDate(appointment.date)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock size={16} className="text-gray-400 mr-3" />
                                <span className="text-gray-700">{formatTime(appointment.time)}</span>
                              </div>
                              {appointment.service_type && (
                                <div className="flex items-start">
                                  <div className="w-4 h-4 bg-primary-600 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                                  <div>
                                    <p className="font-medium text-gray-900">Service: {appointment.service_type}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {appointment.message && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Additional Message:</h4>
                            <p className="text-gray-700">{appointment.message}</p>
                          </div>
                        )}

                        {appointment.status === 'confirmed' && (
                          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800">
                              <strong>Confirmed:</strong> Your appointment is confirmed. Please arrive 15 minutes early.
                            </p>
                          </div>
                        )}

                        {appointment.status === 'cancelled' && (
                          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">
                              <strong>Cancelled:</strong> This appointment has been cancelled. Please contact us if you need to reschedule.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default CheckAppointmentsPage;