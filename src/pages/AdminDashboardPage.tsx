import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { getAppointments, updateAppointmentStatus, deleteAppointment, Appointment } from '../lib/supabase';
import { blogPosts } from '../data/blogPosts';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }

    loadAppointments();
  }, [navigate]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    try {
      setError(null);
      await updateAppointmentStatus(id, status);
      // Update the local state immediately for better UX
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === id 
            ? { ...apt, status, updated_at: new Date().toISOString() }
            : apt
        )
      );
    } catch (err) {
      setError(`Failed to update appointment status: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error(err);
      // Reload appointments to sync with database state
      await loadAppointments();
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      setError(null);
      await deleteAppointment(id);
      // Remove from local state immediately
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(`Failed to delete appointment: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error(err);
      setDeleteConfirm(null);
      // Reload appointments to sync with database state
      await loadAppointments();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
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
      year: 'numeric',
      month: 'short',
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

  const stats = [
    {
      title: 'Total Appointments',
      value: appointments.length,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending',
      value: appointments.filter(a => a.status === 'pending').length,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Confirmed',
      value: appointments.filter(a => a.status === 'confirmed').length,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Blog Posts',
      value: blogPosts.length,
      icon: FileText,
      color: 'bg-purple-500'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg p-3`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'appointments'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Calendar size={16} className="inline mr-2" />
                  Appointments
                </button>
                <button
                  onClick={() => setActiveTab('blog')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'blog'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText size={16} className="inline mr-2" />
                  Blog Management
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'appointments' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
                    <button
                      onClick={loadAppointments}
                      className="btn btn-outline"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-red-800 font-medium">Error</h4>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading appointments...</p>
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No appointments found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Appointment
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Service
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {appointments.map((appointment) => (
                            <tr key={appointment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.patient_name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{appointment.patient_email}</div>
                                <div className="text-sm text-gray-500">{appointment.patient_phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatDate(appointment.appointment_date)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatTime(appointment.appointment_time)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{appointment.service_type}</div>
                                {appointment.message && (
                                  <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={appointment.message}>
                                    {appointment.message}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                  {appointment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  {appointment.status === 'pending' && (
                                    <button
                                      onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                                      className="text-green-600 hover:text-green-900 p-1 rounded"
                                      title="Confirm Appointment"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                  )}
                                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                    <button
                                      onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                      className="text-red-600 hover:text-red-900 p-1 rounded"
                                      title="Cancel Appointment"
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  )}
                                  {appointment.status === 'confirmed' && (
                                    <button
                                      onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                      title="Mark as Completed"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                  )}
                                  {deleteConfirm === appointment.id ? (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => handleDeleteAppointment(appointment.id)}
                                        className="text-red-600 hover:text-red-900 p-1 rounded text-xs"
                                        title="Confirm Delete"
                                      >
                                        ✓
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="text-gray-600 hover:text-gray-900 p-1 rounded text-xs"
                                        title="Cancel Delete"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteConfirm(appointment.id)}
                                      className="text-red-600 hover:text-red-900 p-1 rounded"
                                      title="Delete Appointment"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'blog' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Blog Management</h2>
                    <button className="btn btn-primary flex items-center">
                      <Plus size={16} className="mr-2" />
                      Create New Post
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title.en}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {post.title.en}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {post.excerpt.en}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatDate(post.date)}
                            </span>
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Edit size={16} />
                              </button>
                              <button className="text-red-600 hover:text-red-800">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;