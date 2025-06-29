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
  AlertTriangle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { 
  getAppointments, 
  getAppointmentStats,
  updateAppointmentStatus, 
  deleteAppointment, 
  Appointment,
  AppointmentStats
} from '../lib/supabase';
import { isAuthenticated, signOut, getCurrentUser } from '../lib/auth';
import { blogPosts } from '../data/blogPosts';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats>({ total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [appointmentsData, statsData] = await Promise.all([
        getAppointments(),
        getAppointmentStats()
      ]);
      
      setAppointments(appointmentsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    // Prevent multiple simultaneous operations on the same appointment
    if (processingIds.has(id)) {
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(id));
      setError(null);
      
      const updatedAppointment = await updateAppointmentStatus(id, status);
      
      // Update the local state immediately for better UX
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === id 
            ? updatedAppointment
            : apt
        )
      );

      // Update stats
      await loadStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // If appointment was not found, remove it from local state and show a less alarming message
      if (errorMessage.includes('not found') || errorMessage.includes('deleted')) {
        setAppointments(prev => prev.filter(apt => apt.id !== id));
        setError('This appointment was already modified or removed. The list has been updated.');
      } else {
        setError(`Failed to update appointment status: ${errorMessage}`);
        // Reload appointments to sync with database state
        await loadData();
      }
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    // Prevent multiple simultaneous operations on the same appointment
    if (processingIds.has(id)) {
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(id));
      setError(null);
      
      await deleteAppointment(id);
      
      // Remove from local state immediately
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      setDeleteConfirm(null);

      // Update stats
      await loadStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // If appointment was not found, remove it from local state
      if (errorMessage.includes('not found') || errorMessage.includes('deleted')) {
        setAppointments(prev => prev.filter(apt => apt.id !== id));
        setError('This appointment was already removed. The list has been updated.');
      } else {
        setError(`Failed to delete appointment: ${errorMessage}`);
        // Reload appointments to sync with database state
        await loadData();
      }
      
      setDeleteConfirm(null);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getAppointmentStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin');
  };

  const dismissError = () => {
    setError(null);
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

  const currentUser = getCurrentUser();

  const dashboardStats = [
    {
      title: 'Total Appointments',
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Confirmed',
      value: stats.confirmed,
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
        <title>Admin Dashboard | Dr. Gürkan Eryanılmaz</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                {currentUser && (
                  <p className="text-sm text-gray-600">Welcome back, {currentUser.email}</p>
                )}
              </div>
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
            {dashboardStats.map((stat, index) => (
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
                  Appointments ({stats.total})
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'analytics'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 size={16} className="inline mr-2" />
                  Analytics
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
                    <h2 className="text-xl font-semibold text-gray-900">Appointments Management</h2>
                    <button
                      onClick={loadData}
                      className="btn btn-outline flex items-center"
                      disabled={isLoading}
                    >
                      <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      {isLoading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>

                  {error && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-amber-800 font-medium">Notice</h4>
                        <p className="text-amber-700 text-sm mt-1">{error}</p>
                      </div>
                      <button
                        onClick={dismissError}
                        className="text-amber-500 hover:text-amber-700 ml-3"
                      >
                        <XCircle size={16} />
                      </button>
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
                          {appointments.map((appointment) => {
                            const isProcessing = processingIds.has(appointment.id);
                            return (
                              <tr key={appointment.id} className={`hover:bg-gray-50 ${isProcessing ? 'opacity-50' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {appointment.name}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{appointment.email}</div>
                                  <div className="text-sm text-gray-500">{appointment.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {formatDate(appointment.date)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatTime(appointment.time)}
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
                                        disabled={isProcessing}
                                        className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Confirm Appointment"
                                      >
                                        <CheckCircle size={16} />
                                      </button>
                                    )}
                                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                      <button
                                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                        disabled={isProcessing}
                                        className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Cancel Appointment"
                                      >
                                        <XCircle size={16} />
                                      </button>
                                    )}
                                    {appointment.status === 'confirmed' && (
                                      <button
                                        onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                        disabled={isProcessing}
                                        className="text-blue-600 hover:text-blue-900 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Mark as Completed"
                                      >
                                        <CheckCircle size={16} />
                                      </button>
                                    )}
                                    {deleteConfirm === appointment.id ? (
                                      <div className="flex space-x-1">
                                        <button
                                          onClick={() => handleDeleteAppointment(appointment.id)}
                                          disabled={isProcessing}
                                          className="text-red-600 hover:text-red-900 p-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                          title="Confirm Delete"
                                        >
                                          ✓
                                        </button>
                                        <button
                                          onClick={() => setDeleteConfirm(null)}
                                          disabled={isProcessing}
                                          className="text-gray-600 hover:text-gray-900 p-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                          title="Cancel Delete"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setDeleteConfirm(appointment.id)}
                                        disabled={isProcessing}
                                        className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Delete Appointment"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Total Appointments</h3>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Pending</h3>
                      <p className="text-3xl font-bold">{stats.pending}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Confirmed</h3>
                      <p className="text-3xl font-bold">{stats.confirmed}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Completed</h3>
                      <p className="text-3xl font-bold">{stats.completed}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Appointment Status Distribution</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Pending', value: stats.pending, total: stats.total, color: 'bg-yellow-500' },
                        { label: 'Confirmed', value: stats.confirmed, total: stats.total, color: 'bg-green-500' },
                        { label: 'Completed', value: stats.completed, total: stats.total, color: 'bg-blue-500' },
                        { label: 'Cancelled', value: stats.cancelled, total: stats.total, color: 'bg-red-500' }
                      ].map((item) => {
                        const percentage = stats.total > 0 ? (item.value / stats.total) * 100 : 0;
                        return (
                          <div key={item.label} className="flex items-center">
                            <div className="w-24 text-sm font-medium">{item.label}</div>
                            <div className="flex-1 mx-4">
                              <div className="bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${item.color} h-2 rounded-full transition-all duration-300`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="w-16 text-sm text-gray-600 text-right">
                              {item.value} ({percentage.toFixed(1)}%)
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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