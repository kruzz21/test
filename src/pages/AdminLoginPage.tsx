import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authenticateUser, setAuthState } from '../lib/auth';
import AdminLanguageSwitcher from '../components/admin/LanguageSwitcher';

interface LoginForm {
  email: string;
  password: string;
}

const AdminLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const response = await authenticateUser(data.email, data.password);
      
      if (response.success && response.user && response.session_token) {
        // Check if user is admin
        if (response.user.role !== 'admin') {
          setLoginError(t('admin.login.accessDenied'));
          return;
        }
        
        setAuthState(response.user, response.session_token);
        navigate('/admin/dashboard');
      } else {
        setLoginError(response.message || t('admin.login.invalidCredentials'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(t('admin.login.loginFailedMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('admin.login.title')} | Dr. Gürkan Eryanılmaz</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4">
          <AdminLanguageSwitcher />
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              {t('admin.login.title')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t('admin.login.subtitle')}
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            {loginError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-800 font-medium">{t('admin.login.loginFailed')}</h4>
                  <p className="text-red-700 text-sm mt-1">{loginError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('admin.login.email')}
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`form-input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder={t('admin.login.emailPlaceholder')}
                    {...register('email', { 
                      required: t('admin.login.validation.emailRequired'),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t('admin.login.validation.emailInvalid')
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('admin.login.password')}
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`form-input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder={t('admin.login.passwordPlaceholder')}
                    {...register('password', { required: t('admin.login.validation.passwordRequired') })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('admin.login.signingIn')}
                    </>
                  ) : (
                    t('admin.login.signIn')
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                {t('admin.login.secureAuth')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;