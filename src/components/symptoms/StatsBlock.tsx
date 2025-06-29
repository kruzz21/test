import { useTranslation } from 'react-i18next';
import CounterAnimation from '../ui/CounterAnimation';

const StatsBlock = () => {
  const { t } = useTranslation();
  
  const stats = [
    { value: 10000, label: t('home.stats.kneeReplacements'), icon: '🦿' },
    { value: 5000, label: t('home.stats.fractureSurgeries'), icon: '🦴' },
    { value: 5000, label: t('home.stats.arthroscopies'), icon: '🔬' },
    { value: 500, label: t('home.stats.hipSurgeries'), icon: '👶' },
    { value: 350, label: t('home.stats.clubfoot'), icon: '👣' }
  ];

  return (
    <div className="bg-primary-50 rounded-lg p-8 my-12">
      <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
        {t('home.stats.title')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="text-center bg-white rounded-lg p-4 shadow-sm"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <h4 className="text-2xl md:text-3xl font-bold mb-2 text-primary-600">
              <CounterAnimation end={stat.value} duration={2} />
              <span className="text-lg">+</span>
            </h4>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBlock;