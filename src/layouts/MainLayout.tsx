import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const MainLayout = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <meta property="og:title" content={t('meta.title')} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <html lang={i18n.language} />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          <Outlet />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default MainLayout;
