import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';
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
        isScrolled ? 'bg-white shadow-lg py-3' : 'bg-white/95 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo - Updated to match reference design */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Dr</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-900 font-bold text-lg leading-tight">Dr. Eryanılmaz</span>
            <span className="text-gray-600 text-xs">Orthopedic Specialist</span>
          </div>
        </Link>

        {/* Desktop Navigation - Updated styling to match reference */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" end className={({isActive}) =>
            `text-sm font-medium transition-colors hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-gray-700'
            }`
          }>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/about" className={({isActive}) =>
            `text-sm font-medium transition-colors hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-gray-700'
            }`
          }>
            {t('nav.about')}
          </NavLink>
          <NavLink to="/services" className={({isActive}) =>
            `text-sm font-medium transition-colors hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-gray-700'
            }`
          }>
            {t('nav.services')}
          </NavLink>
          <NavLink to="/symptoms" className={({isActive}) =>
            `text-sm font-medium transition-colors hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-gray-700'
            }`
          }>
            {t('nav.symptoms')}
          </NavLink>
          <NavLink to="/gallery" className={({isActive}) =>
            `text-sm font-medium transition-colors hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-gray-700'
            }`
          }>
            Gallery
          </NavLink>
          <NavLink to="/blog" className={({isActive}) =>
            `text-sm font-medium transition-colors hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-gray-700'
            }`
          }>
            {t('nav.blog')}
          </NavLink>
          <NavLink to="/testimonials" className={({isActive}) =>
            `text-sm font-medium transition-colors hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-gray-700'
            }`
          }>
            {t('nav.testimonials')}
          </NavLink>
          <NavLink to="/contact" className={({isActive}) =>
            `text-sm font-medium transition-colors hover:text-blue-600 ${
              isActive ? 'text-blue-600' : 'text-gray-700'
            }`
          }>
            {t('nav.contact')}
          </NavLink>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Book Appointment Button - Updated to match reference */}
          <Link 
            to="/contact" 
            className="hidden md:inline-flex items-center px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Appointment
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center text-gray-700 hover:text-blue-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Updated styling */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0 py-4 border-t">
          <nav className="flex flex-col space-y-2 px-4">
            <NavLink to="/" end className={({isActive}) =>
              `py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/about" className={({isActive}) =>
              `py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.about')}
            </NavLink>
            <NavLink to="/services" className={({isActive}) =>
              `py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.services')}
            </NavLink>
            <NavLink to="/symptoms" className={({isActive}) =>
              `py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.symptoms')}
            </NavLink>
            <NavLink to="/gallery" className={({isActive}) =>
              `py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`
            } onClick={() => setIsMenuOpen(false)}>
              Gallery
            </NavLink>
            <NavLink to="/blog" className={({isActive}) =>
              `py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.blog')}
            </NavLink>
            <NavLink to="/testimonials" className={({isActive}) =>
              `py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.testimonials')}
            </NavLink>
            <NavLink to="/contact" className={({isActive}) =>
              `py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.contact')}
            </NavLink>
            <div className="pt-2 border-t border-gray-200 mt-2">
              <LanguageSwitcher />
            </div>
            <Link 
              to="/contact" 
              className="mt-4 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Book Appointment
            </Link>
          </nav>
        </div>
      )}

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </header>
  );
};

export default Header;