import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-primary-700 text-white">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" data-aos="fade-up">
          {t('home.cta.title')}
        </h2>
        <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8" data-aos="fade-up" data-aos-delay="100">
          {t('home.cta.description')}
        </p>
        <div data-aos="fade-up" data-aos-delay="200">
          <Link 
            to="/contact" 
            className="btn bg-white text-primary-700 hover:bg-gray-100 transition-colors px-8 py-4"
          >
            {t('home.cta.button')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;