import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Clock, Instagram, MessageCircle, Paperclip } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import StreamlinedAppointmentBooking from '../components/appointment/StreamlinedAppointmentBooking';

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{`${t('nav.contact')} | ${t('meta.title')}`}</title>
      </Helmet>
      
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-600 text-white">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-primary-100">{t('contact.subtitle')}</p>
        </div>
      </div>
      
      {/* Contact Content */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Streamlined Appointment Booking */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-8" data-aos="fade-up">
                <StreamlinedAppointmentBooking />
              </div>
            </div>
            
            {/* Right Column - Contact Information */}
            <div data-aos="fade-up" data-aos-delay="100">
              <SectionHeading 
                title={t('contact.info.title')}
              />
              
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <MapPin size={24} className="text-primary-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{t('contact.info.address')}</h3>
                      <p className="text-gray-700">Medera Hospital, Baku, Azerbaijan</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Phone size={24} className="text-primary-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{t('contact.info.phone')}</h3>
                      <p className="text-gray-700">
                        <a 
                          href="tel:+994553977874" 
                          className="hover:text-primary-600 transition-colors"
                        >
                          +994 55 397 78 74
                        </a>
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Clock size={24} className="text-primary-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{t('contact.info.workingHours')}</h3>
                      <p className="text-gray-700">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-700">Saturday: 9:00 AM - 2:00 PM</p>
                      <p className="text-gray-700">Sunday: Closed</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Paperclip size={24} className="text-primary-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Social Media & Live Support</h3>
                      <div className="space-y-3">
                        <p className="text-gray-700 flex items-center">
                          <Instagram size={20} className="text-primary-600 mr-3" />
                          <a 
                            href="https://www.instagram.com/uzmantravmatolojiortoped" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary-600 transition-colors"
                          >
                            Instagram: @uzmantravmatolojiortoped
                          </a>
                        </p>
                        <p className="text-gray-700 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 mr-3 flex-shrink-0">
                            <path d="M9.5 2v11.5a3.5 3.5 0 1 1-3.5-3.5 3.6 3.6 0 0 1 .9.1V9a6.5 6.5 0 1 0 5.7 6.5V7.6a7.2 7.2 0 0 0 3.4.9V5.4a3.9 3.9 0 0 1-3.4-3.9V2z"/>
                          </svg>
                          <a 
                            href="https://www.tiktok.com/@opdrgeryanilmaz" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary-600 transition-colors"
                          >
                            TikTok: @opdrgeryanilmaz
                          </a>
                        </p>
                        <p className="text-gray-700 flex items-center">
                          <MessageCircle size={20} className="text-primary-600 mr-3" />
                          <a 
                            href="https://wa.me/994553977874" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary-600 transition-colors"
                          >
                            WhatsApp Live Support
                          </a>
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Google Maps */}
              <div className="bg-white rounded-lg shadow-md p-4 h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.657638836267!2d49.83895701296392!3d40.41643457132072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d9a1dba80bf%3A0x75c3a357a5ff838e!2sMedEra%20Hospital!5e0!3m2!1sen!2sus!4v1748452660630!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Doctor's Office Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;