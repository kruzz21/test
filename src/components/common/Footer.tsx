import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Instagram, Atom as Youtube, Twitter, Linkedin, Phone, MapPin, Clock } from 'lucide-react';

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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-tiktok">
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

  const services = [
    t('footer.services.arthroscopic'),
    t('footer.services.joint'),
    t('footer.services.fracture'),
    t('footer.services.pediatric'),
    t('footer.services.sports')
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Dr. Gürkan Eryanılmaz</h3>
            <p className="text-gray-300 mb-4">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex space-x-4 mt-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary-400 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.blog')}
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.testimonials')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.services.title')}</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index} className="text-gray-300">{service}</li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 flex-shrink-0 text-primary-400" />
                <span className="text-gray-300">Medera Hospital, Baku, Azerbaijan</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 flex-shrink-0 text-primary-400" />
                <a href="tel:+994553977874" className="text-gray-300 hover:text-white transition-colors">
                  +994 55 397 78 74
                </a>
              </li>
              <li className="flex items-center">
                <Clock size={20} className="mr-2 flex-shrink-0 text-primary-400" />
                <span className="text-gray-300">Mon-Fri: 9:00 - 18:00</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
