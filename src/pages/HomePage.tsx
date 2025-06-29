import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

// Components
import HeroSection from '../components/home/HeroSection';
import IntroSection from '../components/home/IntroSection';
import ServicesSection from '../components/home/ServicesSection';
import StatsSection from '../components/home/StatsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import BlogSection from '../components/home/BlogSection';
import CtaSection from '../components/home/CtaSection';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('meta.title')}</title>
      </Helmet>
      
      <HeroSection />
      <IntroSection />
      <ServicesSection />
      <StatsSection />
      <TestimonialsSection />
      <BlogSection />
      <CtaSection />
    </>
  );
};

export default HomePage;