import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, XCircle, AlertCircle, User, Phone, Mail, Calendar } from 'lucide-react';
import { getAppointments, updateAppointmentStatus, deleteAppointment, Appointment } from '../../lib/supabase';

const AppointmentRequests: React.FC = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAppointments();
      // Filter to show only pending requests
      const pendingRequests = data.filter(apt => apt.status === 'pending');
      setAppointments(pendingRequests);
    } catch (err) {
      setError(t('admin.appointments.requests.error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    if (processingIds.has(id)) return;

    try {
      setProcessingIds(prev => new Set(prev).add(id));
      setError(null);
      
      await updateAppointmentStatus(id, status);
      
      // Remove from pending list if confirmed or cancelled
      if (status === 'confirmed' || status === 'cancelled') {
        setAppointments(prev => prev.filter(apt => apt.id !== id));
      }
    } catch (err) {
      setError(`Failed to ${status} appointment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (processingIds.has(id)) return;

    try {
      setProcessingIds(prev => new Set(prev).add(id));
      setError(null);
      
      await deleteAppointment(id);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
    } catch (err) {
      setError(`Failed to delete appointment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Clock className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">{t('admin.appointments.requests.title')}</h2>
        </div>
        <button
          onClick={loadAppointments}
          className="btn btn-outline"
          disabled={loading}
        >
          {loading ? t('admin.appointments.requests.loading') : t('admin.appointments.requests.refresh')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">{t('admin.appointments.requests.error')}</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Appointment Requests */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('admin.appointments.requests.loading')}</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('admin.appointments.requests.noPendingRequests')}</h3>
          <p className="text-gray-600">{t('admin.appointments.requests.allProcessed')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const isProcessing = processingIds.has(appointment.id);
            
            return (
              <div 
                key={appointment.id} 
                className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${isProcessing ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{appointment.name}</h3>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        {t('admin.appointments.requests.pendingApproval')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    {t('admin.appointments.requests.requestedOn')} {formatDate(appointment.created_at)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">{t('admin.appointments.requests.contactInformation')}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-700">{appointment.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-700">{appointment.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">{t('admin.appointments.requests.appointmentDetails')}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-700">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-700">{formatTime(appointment.time)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">Service: </span>
                        <span className="text-gray-700">{appointment.service_type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {appointment.message && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('admin.appointments.requests.patientMessage')}</h4>
                    <p className="text-gray-700 text-sm">{appointment.message}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                      disabled={isProcessing}
                      className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('admin.appointments.requests.actions.confirm')}</span>
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                      disabled={isProcessing}
                      className="btn btn-outline border-red-300 text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{t('admin.appointments.requests.actions.decline')}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteAppointment(appointment.id)}
                    disabled={isProcessing}
                    className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t('admin.appointments.requests.actions.delete')}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentRequests;