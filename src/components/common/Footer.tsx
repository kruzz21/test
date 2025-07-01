import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Instagram, Twitter, Linkedin, Phone, MapPin, Clock, Mail } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  
  const socialLinks = [
    {
      icon: Instagram,
      href: 'https://www.instagram.com/uzmantravmatolojiortoped',
      label: 'Instagram'
    },
    {
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tiktok">
          <path d="M9.5 2v11.5a3.5 3.5 0 1 1-3.5-3.5 3.6 3.6 0 0 1 .9.1V9a6.5 6.5 0 1 0 5.7 6.5V7.6a7.2 7.2 0 0 0 3.4.9V5.4a3.9 3.9 0 0 1-3.4-3.9V2z"/>
        </svg>
      ),
      href: 'https://www.tiktok.com/@opdrgeryanilmaz',
      label: 'TikTok'
    },
    {
      icon: Twitter,
      href: '#',
      label: 'Twitter'
    },
    {
      icon: Linkedin,
      href: '#',
      label: 'LinkedIn'
    }
  ];

  const quickLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.services'), href: '/services' },
    { name: t('nav.symptoms'), href: '/symptoms' },
    { name: 'Gallery', href: '/gallery' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.testimonials'), href: '/testimonials' },
    { name: t('nav.contact'), href: '/contact' }
  ];

  const services = [
    t('footer.services.arthroscopic'),
    t('footer.services.joint'),
    t('footer.services.fracture'),
    t('footer.services.pediatric'),
    t('footer.services.sports')
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Dr</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Dr. Eryanılmaz</h3>
                <p className="text-gray-400 text-sm">Orthopedic Specialist</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Expert orthopedic care with over 25 years of experience in joint replacements, 
              arthroscopic surgery, and trauma care.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.services.title')}</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index} className="text-gray-300 flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  {service}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="mr-3 flex-shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-gray-300 font-medium">Medera Hospital</p>
                  <p className="text-gray-400 text-sm">Baku, Azerbaijan</p>
                </div>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-3 flex-shrink-0 text-blue-400" />
                <a 
                  href="tel:+994553977874" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  +994 55 397 78 74
                </a>
              </li>
              <li className="flex items-start">
                <Clock size={20} className="mr-3 flex-shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-gray-300 text-sm">Mon-Fri: 9:00 - 18:00</p>
                  <p className="text-gray-300 text-sm">Saturday: 9:00 - 14:00</p>
                </div>
              </li>
            </ul>

            {/* Regional Clinics */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Regional Clinics</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Balakən Regional Clinic</li>
                <li>• Lankaran Medical Center</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link to="/contact" className="hover:text-white transition-colors">
                Get in Touch
              </Link>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <a 
                href="https://wa.me/994553977874" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;