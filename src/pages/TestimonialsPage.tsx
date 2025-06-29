import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import { testimonials } from '../data/testimonials';
import { formatDate } from '../utils/dateFormatter';

const TestimonialsPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'az' | 'en' | 'tr';

  return (
    <>
      <Helmet>
        <title>{`${t('nav.testimonials')} | ${t('meta.title')}`}</title>
      </Helmet>
      
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-600 text-white">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('testimonials.title')}</h1>
          <p className="text-xl text-primary-100">{t('testimonials.subtitle')}</p>
        </div>
      </div>
      
      {/* Testimonials Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                      <div className="flex items-center">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} size={16} className="text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <blockquote className="italic text-gray-700 mb-4">
                    "{testimonial.content[currentLang]}"
                  </blockquote>
                  
                  <p className="text-sm text-gray-500">
                    {formatDate(testimonial.date, currentLang)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeading 
              title={t('home.cta.title')}
              subtitle={t('home.cta.description')}
              centered={true}
            />
            
            <div className="mt-8">
              <a 
                href={`https://wa.me/994553977874`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mr-4"
              >
                WhatsApp
              </a>
              <a 
                href="tel:+994553977874"
                className="btn btn-outline"
              >
                {t('home.cta.button')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TestimonialsPage;