import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Play, Award, Users, Calendar } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import VideoPlayer from '../components/gallery/VideoPlayer';
import MediaTabs from '../components/gallery/MediaTabs';

const GalleryPage = () => {
  const { t } = useTranslation();

  // Sample gallery data - replace with actual content
  const featuredVideo = {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    title: "Welcome Message from Dr. Gürkan Eryanılmaz"
  };

  const photos = [
    {
      id: '1',
      type: 'photo' as const,
      src: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'Modern Operating Theater',
      description: 'State-of-the-art surgical facilities equipped with the latest technology for orthopedic procedures.',
      category: 'Clinic'
    },
    {
      id: '2',
      type: 'photo' as const,
      src: 'https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'Knee Replacement Surgery',
      description: 'Advanced knee replacement procedure using minimally invasive techniques.',
      category: 'Surgeries'
    },
    {
      id: '3',
      type: 'photo' as const,
      src: 'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'Pediatric Consultation',
      description: 'Specialized care for children with orthopedic conditions in a child-friendly environment.',
      category: 'Pediatric'
    },
    {
      id: '4',
      type: 'photo' as const,
      src: 'https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'Physical Therapy Session',
      description: 'Comprehensive rehabilitation programs designed for optimal recovery.',
      category: 'Rehabilitation'
    },
    {
      id: '5',
      type: 'photo' as const,
      src: 'https://images.pexels.com/photos/7088530/pexels-photo-7088530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'Medical Conference',
      description: 'Dr. Eryanılmaz presenting latest research at international orthopedic conference.',
      category: 'Events'
    },
    {
      id: '6',
      type: 'photo' as const,
      src: 'https://images.pexels.com/photos/5407205/pexels-photo-5407205.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'Patient Consultation',
      description: 'Detailed consultation process ensuring personalized treatment plans.',
      category: 'Clinic'
    }
  ];

  const videos = [
    {
      id: '1',
      type: 'video' as const,
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'Arthroscopic Knee Surgery',
      description: 'Demonstration of minimally invasive arthroscopic knee surgery technique.',
      category: 'Surgeries'
    },
    {
      id: '2',
      type: 'video' as const,
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'Clubfoot Treatment',
      description: 'Comprehensive approach to clubfoot correction using the Ponseti method.',
      category: 'Pediatric'
    },
    {
      id: '3',
      type: 'video' as const,
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'Post-Surgery Rehabilitation',
      description: 'Patient recovery journey and rehabilitation exercises after hip replacement.',
      category: 'Rehabilitation'
    },
    {
      id: '4',
      type: 'video' as const,
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnail: 'https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'Medical Education',
      description: 'Teaching session on advanced orthopedic surgical techniques.',
      category: 'Education'
    }
  ];

  const achievements = [
    {
      icon: Award,
      number: '25+',
      label: 'Years of Experience'
    },
    {
      icon: Users,
      number: '20K+',
      label: 'Successful Operations'
    },
    {
      icon: Calendar,
      number: '500+',
      label: 'Pediatric Hip Surgeries'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{`Gallery | ${t('meta.title')}`}</title>
        <meta name="description" content="Explore Dr. Gürkan Eryanılmaz's medical gallery featuring surgical procedures, clinic facilities, and patient care moments." />
      </Helmet>
      
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-600 text-white">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Medical Gallery</h1>
          <p className="text-xl text-primary-100">Showcasing Excellence in Orthopedic Care</p>
        </div>
      </div>
      
      {/* Doctor Bio Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Doctor Image */}
            <div className="lg:col-span-1" data-aos="fade-right">
              <div className="relative">
                <img 
                  src="/img/aboutsection.webp"
                  alt="Op. Dr. Gürkan Eryanılmaz" 
                  className="rounded-lg shadow-lg w-full h-auto"
                />
                <div className="absolute -bottom-5 -right-5 bg-primary-600 text-white p-4 rounded-lg shadow-lg">
                  <p className="text-2xl font-bold">25+</p>
                  <p className="text-sm uppercase tracking-wide">Years Experience</p>
                </div>
              </div>
            </div>
            
            {/* Bio Content */}
            <div className="lg:col-span-2" data-aos="fade-left">
              <SectionHeading 
                title="Op. Dr. Gürkan Eryanılmaz"
                subtitle="Leading Orthopedic Surgeon & Medical Innovator"
              />
              
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                With over 25 years of dedicated experience in orthopedics and traumatology, Dr. Gürkan Eryanılmaz has established himself as a leading authority in the field. His expertise spans across complex joint replacements, pediatric orthopedics, and innovative surgical techniques.
              </p>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Dr. Eryanılmaz has successfully performed over 20,000 operations, including 10,000+ knee replacements and 500+ pediatric hip surgeries. His commitment to excellence and patient-centered care has made him a trusted name in orthopedic medicine across Azerbaijan and beyond.
              </p>

              {/* Achievements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index}
                    className="text-center p-4 bg-gray-50 rounded-lg"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <achievement.icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary-600 mb-1">{achievement.number}</div>
                    <div className="text-sm text-gray-600">{achievement.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Video Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <SectionHeading 
            title="Welcome Message"
            subtitle="A personal introduction from Dr. Gürkan Eryanılmaz"
            centered={true}
          />
          
          <div className="max-w-4xl mx-auto" data-aos="fade-up">
            <VideoPlayer
              src={featuredVideo.src}
              poster={featuredVideo.poster}
              title={featuredVideo.title}
              className="aspect-video shadow-xl"
            />
            
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{featuredVideo.title}</h3>
              <p className="text-gray-600">
                Learn about Dr. Eryanılmaz's approach to patient care and his commitment to advancing orthopedic medicine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Media Gallery Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <SectionHeading 
            title="Medical Gallery"
            subtitle="Explore our facilities, procedures, and patient care moments"
            centered={true}
          />
          
          <div data-aos="fade-up">
            <MediaTabs photos={photos} videos={videos} />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-aos="fade-up">
            Experience Excellence in Orthopedic Care
          </h2>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8" data-aos="fade-up" data-aos-delay="100">
            Schedule a consultation with Dr. Gürkan Eryanılmaz and discover personalized treatment solutions.
          </p>
          <div data-aos="fade-up" data-aos-delay="200">
            <a 
              href="/contact" 
              className="btn bg-white text-primary-700 hover:bg-gray-100 transition-colors px-8 py-4 inline-flex items-center"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book an Appointment
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default GalleryPage;