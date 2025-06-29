import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, ChevronRight as ArrowRight } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import { testimonials } from '../../data/testimonials';

const TestimonialsSection = () => {
  const { t, i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  
  const currentLang = i18n.language as 'az' | 'en' | 'tr';
  
  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  
  // Only show 3 testimonials on homepage
  const featuredTestimonials = testimonials.slice(0, 3);

  return (
    <section className="section bg-white">
      <div className="container">
        <SectionHeading 
          title={t('home.testimonials.title')}
          centered={true}
        />
        
        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Slider */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {featuredTestimonials.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                    <div className="flex items-center mb-6">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h4 className="text-xl font-semibold">{testimonial.name}</h4>
                        <div className="flex items-center">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} size={16} className="text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">"{testimonial.content[currentLang]}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Arrows */}
          <button 
            className="absolute top-1/2 left-0 -ml-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-primary-600 focus:outline-none"
            onClick={handlePrevious}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            className="absolute top-1/2 right-0 -mr-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-primary-600 focus:outline-none"
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Slider Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {featuredTestimonials.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === activeIndex ? 'bg-primary-600' : 'bg-gray-300'
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            to="/testimonials" 
            className="btn btn-outline inline-flex items-center"
          >
            {t('home.testimonials.viewAll')}
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;