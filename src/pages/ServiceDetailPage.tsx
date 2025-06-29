import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import { getServiceData } from '../data/services';

interface ServiceDetailPageProps {
  serviceId?: number;
}

const ServiceDetailPage = ({ serviceId }: ServiceDetailPageProps) => {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const currentLang = i18n.language as 'az' | 'en' | 'tr';
  
  // If serviceId is provided via props, use it, otherwise try to find service by slug from URL
  let service;
  
  if (serviceId) {
    service = getServiceData(serviceId);
  } else if (params.slug) {
    // Find service by slug
    const allServices = [1, 2, 3, 4, 5].map(id => getServiceData(id)).filter(Boolean);
    service = allServices.find(s => s?.slug === params.slug);
  }
  
  // If service not found, redirect to services page
  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{`${service.title[currentLang]} | ${t('meta.title')}`}</title>
      </Helmet>
      
      {/* Page Header */}
      <div 
        className="pt-24 pb-12 bg-cover bg-center text-white relative"
        style={{
          backgroundImage: `url(${service.imageUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <div className="container relative">
          <Link 
            to="/services" 
            className="inline-flex items-center text-white mb-6 hover:text-primary-200 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            {t('services.title')}
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{service.title[currentLang]}</h1>
        </div>
      </div>
      
      {/* Service Description */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <SectionHeading 
              title={service.title[currentLang]}
            />
            
            <p className="text-lg text-gray-700 mb-8" data-aos="fade-up">
              {service.description[currentLang]}
            </p>
            
            {/* Procedures */}
            <div className="mt-12" data-aos="fade-up">
              <h3 className="text-2xl font-semibold mb-6">Procedures</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {service.procedures?.map((procedure, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 p-6 rounded-lg"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <h4 className="text-xl font-semibold mb-2 flex items-start">
                      <CheckCircle size={20} className="text-primary-600 mr-2 mt-1 flex-shrink-0" />
                      {procedure.name[currentLang]}
                    </h4>
                    <p className="text-gray-700">{procedure.description[currentLang]}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CTA */}
            <div className="mt-16 p-8 bg-primary-50 rounded-lg text-center" data-aos="fade-up">
              <h3 className="text-2xl font-semibold mb-4">{t('home.cta.title')}</h3>
              <p className="text-gray-700 mb-6">
                {t('home.cta.description')}
              </p>
              <Link to="/contact" className="btn btn-primary">
                {t('home.cta.button')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServiceDetailPage;