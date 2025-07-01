import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Calendar } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import WhatsAppButton from './WhatsAppButton';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg py-2' : 'bg-white/95 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo - Updated to match reference design */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Dr</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-gray-900 font-bold text-lg leading-tight">Dr. Eryanılmaz</div>
            <div className="text-gray-600 text-xs">Orthopedic Specialist</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          <NavLink to="/" end className={({isActive}) =>
            `px-4 py-2 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
          }>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/about" className={({isActive}) =>
            `px-4 py-2 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
          }>
            {t('nav.about')}
          </NavLink>
          <NavLink to="/services" className={({isActive}) =>
            `px-4 py-2 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
          }>
            {t('nav.services')}
          </NavLink>
          <NavLink to="/symptoms" className={({isActive}) =>
            `px-4 py-2 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
          }>
            {t('nav.symptoms')}
          </NavLink>
          <NavLink to="/blog" className={({isActive}) =>
            `px-4 py-2 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
          }>
            {t('nav.blog')}
          </NavLink>
          <NavLink to="/contact" className={({isActive}) =>
            `px-4 py-2 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
          }>
            {t('nav.contact')}
          </NavLink>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Book Appointment Button - Desktop */}
          <div className="hidden lg:block">
            <Link 
              to="/contact" 
              className="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Calendar size={18} className="mr-2" />
              Book Appointment
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden flex items-center text-gray-700 hover:text-primary-600 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg absolute top-full left-0 right-0 py-4 border-t border-gray-100">
          <nav className="flex flex-col space-y-2 px-4">
            <NavLink to="/" end className={({isActive}) =>
              `px-4 py-3 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/about" className={({isActive}) =>
              `px-4 py-3 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.about')}
            </NavLink>
            <NavLink to="/services" className={({isActive}) =>
              `px-4 py-3 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.services')}
            </NavLink>
            <NavLink to="/symptoms" className={({isActive}) =>
              `px-4 py-3 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.symptoms')}
            </NavLink>
            <NavLink to="/blog" className={({isActive}) =>
              `px-4 py-3 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.blog')}
            </NavLink>
            <NavLink to="/contact" className={({isActive}) =>
              `px-4 py-3 text-gray-700 font-medium transition-all duration-200 rounded-lg hover:text-primary-600 hover:bg-primary-50 ${isActive ? 'text-primary-600 bg-primary-50' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.contact')}
            </NavLink>
            
            {/* Mobile Book Appointment Button */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <Link 
                to="/contact" 
                className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar size={18} className="mr-2" />
                Book Appointment
              </Link>
            </div>
            
            <div className="pt-2 border-t border-gray-200 mt-2">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </header>
  );
};

export default Header;