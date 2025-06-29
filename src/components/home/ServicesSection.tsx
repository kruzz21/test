import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import { services } from '../../data/services';
import ServiceCard from '../services/ServiceCard';

const ServicesSection = () => {
  const { t, i18n } = useTranslation();
  
  // Only show 3 services on homepage
  const featuredServices = services.slice(0, 3);

  return (
    <section className="section bg-gray-50">
      <div className="container">
        <SectionHeading 
          title={t('home.services.title')}
          centered={true}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            to="/services" 
            className="btn btn-outline inline-flex items-center"
          >
            {t('home.services.viewAll')}
            <ChevronRight size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;