import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import SectionHeading from '../../components/common/SectionHeading';
import StatsBlock from '../../components/symptoms/StatsBlock';

const ElbowConditionsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{`${t('symptoms.elbow.title')} | ${t('meta.title')}`}</title>
      </Helmet>
      
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-600 text-white">
        <div className="container">
          <Link 
            to="/symptoms" 
            className="inline-flex items-center text-white mb-6 hover:text-primary-200 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            {t('symptoms.title')}
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('symptoms.elbow.title')}</h1>
        </div>
      </div>
      
      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Overview */}
            <div className="mb-12" data-aos="fade-up">
              <p className="text-lg text-gray-700 leading-relaxed">
                {t('symptoms.elbow.overview')}
              </p>
            </div>

            {/* Causes */}
            <div className="mb-12" data-aos="fade-up">
              <h2 className="text-2xl font-bold mb-6">{t('symptoms.elbow.causes.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {t('symptoms.elbow.causes.items', { returnObjects: true }).map((item: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle size={20} className="text-primary-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="mb-12" data-aos="fade-up">
              <h2 className="text-2xl font-bold mb-6">{t('symptoms.elbow.symptoms.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {t('symptoms.elbow.symptoms.items', { returnObjects: true }).map((item: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle size={20} className="text-primary-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatments */}
            <div className="mb-12" data-aos="fade-up">
              <h2 className="text-2xl font-bold mb-6">{t('symptoms.elbow.treatments.title')}</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Conservative Treatment */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">{t('symptoms.elbow.treatments.conservative.title')}</h3>
                  <ul className="space-y-3">
                    {t('symptoms.elbow.treatments.conservative.items', { returnObjects: true }).map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle size={16} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Surgical Treatment */}
                <div className="bg-primary-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">{t('symptoms.elbow.treatments.surgical.title')}</h3>
                  <ul className="space-y-3">
                    {t('symptoms.elbow.treatments.surgical.items', { returnObjects: true }).map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle size={16} className="text-primary-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Dr. Treatment Approach */}
            <div className="mb-12 p-6 bg-blue-50 rounded-lg" data-aos="fade-up">
              <h3 className="text-xl font-semibold mb-4 text-blue-900">Dr. Gürkan Eryanılmaz's Approach</h3>
              <p className="text-blue-800">{t('symptoms.elbow.drTreatment')}</p>
            </div>

            {/* Stats Block */}
            <StatsBlock />

            {/* CTA */}
            <div className="mt-16 p-8 bg-primary-600 rounded-lg text-center text-white" data-aos="fade-up">
              <h3 className="text-2xl font-semibold mb-4">{t('home.cta.title')}</h3>
              <p className="text-primary-100 mb-6">
                {t('home.cta.description')}
              </p>
              <Link to="/contact" className="btn bg-white text-primary-600 hover:bg-gray-100">
                {t('home.cta.button')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ElbowConditionsPage;