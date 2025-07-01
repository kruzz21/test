import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20">
      {/* Two-column grid layout matching reference design */}
      <div className="container mx-auto px-4 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-5rem)]">
          
          {/* Left Column - Content */}
          <motion.div 
            className="space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main heading with emphasis on doctor's name */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Dr. Gürkan<br />
                <span className="text-primary-600">Eryanılmaz</span>
              </h1>
              
              {/* Subtitle with professional credentials */}
              <div className="space-y-1">
                <p className="text-xl md:text-2xl text-primary-600 font-semibold">
                  Orthopedic & Traumatology Specialist
                </p>
                <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm md:text-base">Medera Hospital - Baku</span>
                </div>
              </div>
            </div>

            {/* Professional description */}
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Expert orthopedic care with over 25 years of experience. Specializing in 
              joint replacements, arthroscopic surgery, and comprehensive trauma care.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Appointment
              </Link>
              
              <Link 
                to="/services" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Treatments
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Doctor Image */}
          <motion.div 
            className="relative order-1 lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Main doctor image */}
              <img 
                src="/img/aboutsection.webp" 
                alt="Op. Dr. Gürkan Eryanılmaz" 
                className="w-full h-auto max-w-lg mx-auto rounded-2xl shadow-2xl"
              />
              
              {/* Professional credentials overlay */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">25+</div>
                  <div className="text-sm text-gray-600 font-medium">Years Experience</div>
                </div>
              </div>
              
              {/* Additional credential badge */}
              <div className="absolute -top-4 -right-4 bg-primary-600 text-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-xl font-bold mb-1">20K+</div>
                  <div className="text-xs font-medium">Operations</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;