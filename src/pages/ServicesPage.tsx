import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { services } from '../data/services';
import ServiceCard from '../components/services/ServiceCard';

const ServicesPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{`${t('nav.services')} | ${t('meta.title')}`}</title>
      </Helmet>
      
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-600 text-white">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('services.title')}</h1>
          <p className="text-xl text-primary-100">{t('services.subtitle')}</p>
        </div>
      </div>
      
      {/* Services Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesPage;