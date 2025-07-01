import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Eye, MapPin } from 'lucide-react';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content - Hero Text */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Dr. Gürkan
                <br />
                <span className="text-blue-600">Eryanılmaz</span>
              </h1>
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl text-blue-600 font-semibold">
                  Orthopedic & Traumatology Specialist
                </h2>
                <div className="flex items-center text-gray-600 space-x-2">
                  <MapPin size={16} />
                  <span className="text-sm">Medera Hospital - Baku</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-700 leading-relaxed max-w-lg">
              Expert orthopedic care with over 25 years of experience. Specializing in 
              joint replacements, arthroscopic surgery, and comprehensive trauma care.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </Link>
              <Link 
                to="/testimonials" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Treatments
              </Link>
            </div>

            {/* Hospital Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Practice Location</h3>
                  <p className="text-gray-600 text-sm">
                    Currently serving patients in Baku with regional clinics in Balakən and Lankaran
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Doctor Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Main Image */}
              <div className="relative z-10">
                <img 
                  src="/img/aboutsection.webp" 
                  alt="Op. Dr. Gürkan Eryanılmaz" 
                  className="w-full h-auto rounded-3xl shadow-2xl object-cover"
                />
              </div>
              
              {/* Background Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-blue-100 rounded-3xl -z-10"></div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-blue-50 rounded-3xl -z-10"></div>
              
              {/* Professional Gallery Badge */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">📋</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">Professional Gallery</h4>
                  <p className="text-gray-600 text-xs">View Surgery Photos</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" fill="none" className="w-full h-auto">
          <path 
            d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;