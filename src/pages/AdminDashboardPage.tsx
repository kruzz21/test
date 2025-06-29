import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Users, 
  FileText, 
  LogOut, 
  CheckCircle, 
  Clock,
  Plus,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { 
  getAppointments, 
  getAppointmentStats,
  AppointmentStats
} from '../lib/supabase';
import { isAuthenticated, signOut, getCurrentUser, getSessionToken } from '../lib/auth';
import { blogPosts } from '../data/blogPosts';
import AppointmentManagement from '../components/admin/AppointmentManagement';
import AppointmentRequests from '../components/admin/AppointmentRequests';
import AdminLanguageSwitcher from '../components/admin/LanguageSwitcher';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');
  const [stats, setStats] = useState<AppointmentStats>({ total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }

    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/admin');
      return;
    }

    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const statsData = await getAppointmentStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const sessionToken = getSessionToken();
    await signOut(sessionToken || undefined);
    navigate('/admin');
  };

  const currentUser = getCurrentUser();

  const dashboardStats = [
    {
      title: t('admin.dashboard.stats.pendingRequests'),
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: t('admin.dashboard.stats.confirmed'),
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: t('admin.dashboard.stats.totalAppointments'),
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: t('admin.dashboard.stats.blogPosts'),
      value: blogPosts.length,
      icon: FileText,
      color: 'bg-purple-500'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('admin.dashboard.title')} | Dr. Gürkan Eryanılmaz</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
                {currentUser && (
                  <p className="text-sm text-gray-600">{t('admin.dashboard.welcome')}, {currentUser.email}</p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <AdminLanguageSwitcher />
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut size={16} className="mr-2" />
                  {t('admin.dashboard.logout')}
                </button>
              </div>
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
                  onClick={() => setActiveTab('requests')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'requests'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <UserCheck size={16} className="inline mr-2" />
                  {t('admin.dashboard.tabs.requests')} ({stats.pending})
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'calendar'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Calendar size={16} className="inline mr-2" />
                  {t('admin.dashboard.tabs.calendar')}
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
                  {t('admin.dashboard.tabs.analytics')}
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'requests' && <AppointmentRequests />}
              
              {activeTab === 'calendar' && <AppointmentManagement />}

              {activeTab === 'analytics' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('admin.dashboard.analytics.title')}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">{t('admin.dashboard.analytics.total')}</h3>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">{t('admin.dashboard.analytics.pending')}</h3>
                      <p className="text-3xl font-bold">{stats.pending}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">{t('admin.dashboard.analytics.confirmed')}</h3>
                      <p className="text-3xl font-bold">{stats.confirmed}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">{t('admin.dashboard.analytics.completed')}</h3>
                      <p className="text-3xl font-bold">{stats.completed}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">{t('admin.dashboard.analytics.appointmentDistribution')}</h3>
                    <div className="space-y-4">
                      {[
                        { label: t('admin.dashboard.analytics.pending'), value: stats.pending, total: stats.total, color: 'bg-yellow-500' },
                        { label: t('admin.dashboard.analytics.confirmed'), value: stats.confirmed, total: stats.total, color: 'bg-green-500' },
                        { label: t('admin.dashboard.analytics.completed'), value: stats.completed, total: stats.total, color: 'bg-blue-500' },
                        { label: t('admin.dashboard.analytics.cancelled'), value: stats.cancelled, total: stats.total, color: 'bg-red-500' }
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;