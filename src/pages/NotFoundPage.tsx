import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>404 | {t('meta.title')}</title>
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-gray-50">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">{t('notFound.title')}</h2>
          <p className="text-gray-600 text-lg mb-8">{t('notFound.message')}</p>
          <Link to="/" className="btn btn-primary">
            {t('notFound.button')}
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;