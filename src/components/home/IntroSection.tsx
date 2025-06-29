import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SectionHeading from '../common/SectionHeading';

const IntroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="section bg-white">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1" data-aos="fade-right">
            <SectionHeading 
              title={t('home.intro.title')}
            />
            <p className="text-lg text-gray-600 mb-6">
              {t('home.intro.description')}
            </p>
            
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <span className="text-primary-600 font-bold">25+</span>
                </div>
                <p className="font-medium">{t('home.intro.yearsExperience')}</p>
              </div>
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <span className="text-primary-600 font-bold">5+</span>
                </div>
                <p className="font-medium">{t('home.intro.specializations')}</p>
              </div>
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <span className="text-primary-600 font-bold">20K+</span>
                </div>
                <p className="font-medium">{t('home.intro.operations')}</p>
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2" data-aos="fade-left">
            <div className="relative">
              <img 
                src="/img/introsection.webp" 
                alt="Op. Dr. Gürkan Eryanılmaz" 
                className="rounded-lg shadow-xl w-full h-[500px] object-cover object-center"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary-600 text-white p-6 rounded-lg shadow-lg">
                <p className="text-3xl font-bold">25+</p>
                <p className="text-sm uppercase tracking-wide">{t('home.intro.yearsExperienceShort')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
