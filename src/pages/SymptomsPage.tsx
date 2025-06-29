import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import SectionHeading from '../components/common/SectionHeading';
import InteractiveBodyMap from '../components/symptoms/InteractiveBodyMap';
import CategorySidebar from '../components/symptoms/CategorySidebar';
import ContactSidebar from '../components/symptoms/ContactSidebar';

const SymptomsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{`${t('nav.symptoms')} | ${t('meta.title')}`}</title>
      </Helmet>
      
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-600 text-white">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('symptoms.title')}</h1>
          <p className="text-xl text-primary-100">{t('symptoms.subtitle')}</p>
        </div>
      </div>
      
      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Categories */}
            <div className="lg:col-span-3">
              <CategorySidebar />
            </div>

            {/* Center - Interactive Body Map */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t('symptoms.bodyMap.title')}
                  </h2>
                  <p className="text-gray-600">
                    {t('symptoms.description')}
                  </p>
                </div>
                
                <InteractiveBodyMap />
              </div>
            </div>

            {/* Right Sidebar - Contact Form */}
            <div className="lg:col-span-3">
              <ContactSidebar />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SymptomsPage;