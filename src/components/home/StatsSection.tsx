import { useTranslation } from 'react-i18next';
import SectionHeading from '../common/SectionHeading';
import CounterAnimation from '../ui/CounterAnimation';

const StatsSection = () => {
  const { t } = useTranslation();
  
  const stats = [
    { value: 10000, label: t('home.stats.kneeReplacements'), icon: '🦿' },
    { value: 5000, label: t('home.stats.fractureSurgeries'), icon: '🦴' },
    { value: 5000, label: t('home.stats.arthroscopies'), icon: '🔬' },
    { value: 500, label: t('home.stats.hipSurgeries'), icon: '👶' },
    { value: 350, label: t('home.stats.clubfoot'), icon: '👣' }
  ];

  return (
    <section className="py-20 bg-primary-600 text-white">
      <div className="container">
        <SectionHeading 
          title={t('home.stats.title')}
          light={true}
          centered={true}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mt-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <h3 className="text-4xl md:text-5xl font-bold mb-2">
                <CounterAnimation end={stat.value} duration={2} />
                <span className="text-2xl">+</span>
              </h3>
              <p className="text-xl text-primary-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;