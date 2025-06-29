import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Stethoscope, Bone, Activity, Baby, Heart, Zap } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import InteractiveBodyMap from '../components/symptoms/InteractiveBodyMap';
import StreamlinedAppointmentBooking from '../components/appointment/StreamlinedAppointmentBooking';

const SymptomsPage = () => {
  const { t } = useTranslation();

  const categories = [
    {
      title: t('symptoms.shoulder.title'),
      description: t('symptoms.shoulder.overview'),
      icon: Stethoscope,
      link: '/symptoms/shoulder-pain',
      color: 'bg-blue-500'
    },
    {
      title: t('symptoms.elbow.title'),
      description: t('symptoms.elbow.overview'),
      icon: Bone,
      link: '/symptoms/elbow-conditions',
      color: 'bg-green-500'
    },
    {
      title: t('symptoms.wristHand.title'),
      description: t('symptoms.wristHand.overview'),
      icon: Activity,
      link: '/symptoms/wrist-hand',
      color: 'bg-purple-500'
    },
    {
      title: t('symptoms.hip.title'),
      description: t('symptoms.hip.overview'),
      icon: Heart,
      link: '/symptoms/hip-problems',
      color: 'bg-red-500'
    },
    {
      title: t('symptoms.knee.title'),
      description: t('symptoms.knee.overview'),
      icon: Zap,
      link: '/symptoms/knee-conditions',
      color: 'bg-yellow-500'
    },
    {
      title: t('symptoms.footAnkle.title'),
      description: t('symptoms.footAnkle.overview'),
      icon: Activity,
      link: '/symptoms/foot-ankle',
      color: 'bg-indigo-500'
    },
    {
      title: t('symptoms.pediatric.title'),
      description: t('symptoms.pediatric.overview'),
      icon: Baby,
      link: '/symptoms/pediatric-orthopedics',
      color: 'bg-pink-500'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{`${t('symptoms.title')} | ${t('meta.title')}`}</title>
      </Helmet>
      
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-600 text-white">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('symptoms.title')}</h1>
          <p className="text-xl text-primary-100">{t('symptoms.subtitle')}</p>
        </div>
      </div>
      
      {/* Interactive Body Map */}
      <section className="py-16 bg-white">
        <div className="container">
          <SectionHeading 
            title={t('symptoms.bodyMap.title')}
            subtitle={t('symptoms.bodyMap.instruction')}
            centered={true}
          />
          
          <div className="max-w-4xl mx-auto">
            <InteractiveBodyMap />
          </div>
        </div>
      </section>
      
      {/* Treatment Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <SectionHeading 
            title={t('symptoms.categories.title')}
            centered={true}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="p-6">
                  <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-600 transition-colors">
                    {category.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center text-primary-600 group-hover:text-primary-700 transition-colors">
                    <span className="text-sm font-medium">Learn More</span>
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Book Appointment Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <SectionHeading 
              title={t('appointment.title')}
              subtitle={t('appointment.subtitle')}
              centered={true}
            />
            
            <div className="bg-gray-50 rounded-lg p-8">
              <StreamlinedAppointmentBooking />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SymptomsPage;