import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Service, getServiceData } from '../../data/services';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const { t, i18n } = useTranslation();
  const serviceData = getServiceData(service.id);
  
  // Dynamically get the icon from Lucide
  const Icon = Icons[service.icon as keyof typeof Icons] || Icons.Activity;
  
  if (!serviceData) return null;
  
  const currentLang = i18n.language as 'az' | 'en' | 'tr';
  
  return (
    <div 
      className="card group hover:shadow-xl transition-shadow duration-300"
      data-aos="fade-up"
      data-aos-delay={service.id * 100}
    >
      <div className="relative overflow-hidden rounded-t-lg h-48 -mx-6 -mt-6 mb-6">
        <img 
          src={service.imageUrl} 
          alt={serviceData.title[currentLang]} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <Icon size={40} className="text-white" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-3">{serviceData.title[currentLang]}</h3>
      <p className="text-gray-600 mb-4">{serviceData.description[currentLang]}</p>
      
      <Link 
        to={`/services/${service.slug}`}
        className="text-primary-600 font-medium inline-flex items-center hover:text-primary-700"
      >
        {t('services.viewDetails')}
        <span className="ml-1">→</span>
      </Link>
    </div>
  );
};

export default ServiceCard;