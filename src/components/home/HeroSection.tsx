import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: "url('/img/hsection.webp')",
          backgroundPosition: "center 30%"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>
      
      {/* Content */}
      <div className="container relative z-10 text-white text-center px-4">
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t('home.hero.title')}
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl mb-8 text-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t('home.hero.subtitle')}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link 
            to="/contact" 
            className="btn btn-primary text-lg px-8 py-4"
          >
            {t('home.hero.cta')}
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <motion.div 
          className="w-8 h-12 border-2 border-white rounded-full flex items-start justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.div 
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ 
              y: [0, 12, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
