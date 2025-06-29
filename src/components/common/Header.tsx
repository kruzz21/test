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
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-primary-600 font-bold text-xl md:text-2xl">Op. Dr. Gürkan Eryanılmaz</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" end className={({isActive}) =>
            `nav-link ${isActive ? 'active' : ''}`
          }>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/about" className={({isActive}) =>
            `nav-link ${isActive ? 'active' : ''}`
          }>
            {t('nav.about')}
          </NavLink>
          <NavLink to="/services" className={({isActive}) =>
            `nav-link ${isActive ? 'active' : ''}`
          }>
            {t('nav.services')}
          </NavLink>
          <NavLink to="/symptoms" className={({isActive}) =>
            `nav-link ${isActive ? 'active' : ''}`
          }>
            {t('nav.symptoms')}
          </NavLink>
          <NavLink to="/blog" className={({isActive}) =>
            `nav-link ${isActive ? 'active' : ''}`
          }>
            {t('nav.blog')}
          </NavLink>
          <NavLink to="/testimonials" className={({isActive}) =>
            `nav-link ${isActive ? 'active' : ''}`
          }>
            {t('nav.testimonials')}
          </NavLink>
          <NavLink to="/contact" className={({isActive}) =>
            `nav-link ${isActive ? 'active' : ''}`
          }>
            {t('nav.contact')}
          </NavLink>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0 py-4">
          <nav className="flex flex-col space-y-2 px-4">
            <NavLink to="/" end className={({isActive}) =>
              `nav-link ${isActive ? 'active' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/about" className={({isActive}) =>
              `nav-link ${isActive ? 'active' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.about')}
            </NavLink>
            <NavLink to="/services" className={({isActive}) =>
              `nav-link ${isActive ? 'active' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.services')}
            </NavLink>
            <NavLink to="/symptoms" className={({isActive}) =>
              `nav-link ${isActive ? 'active' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.symptoms')}
            </NavLink>
            <NavLink to="/blog" className={({isActive}) =>
              `nav-link ${isActive ? 'active' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.blog')}
            </NavLink>
            <NavLink to="/testimonials" className={({isActive}) =>
              `nav-link ${isActive ? 'active' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.testimonials')}
            </NavLink>
            <NavLink to="/contact" className={({isActive}) =>
              `nav-link ${isActive ? 'active' : ''}`
            } onClick={() => setIsMenuOpen(false)}>
              {t('nav.contact')}
            </NavLink>
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