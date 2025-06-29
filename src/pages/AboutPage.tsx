import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Instagram, Atom as Tiktok, Twitter, Linkedin } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import CounterAnimation from '../components/ui/CounterAnimation';

const AboutPage = () => {
  const { t } = useTranslation();

  const stats = [
    { value: 10000, label: t('home.stats.kneeReplacements'), icon: '🦿' },
    { value: 5000, label: t('home.stats.fractureSurgeries'), icon: '🦴' },
    { value: 5000, label: t('home.stats.arthroscopies'), icon: '🔬' },
    { value: 500, label: t('home.stats.hipSurgeries'), icon: '👶' },
    { value: 350, label: t('home.stats.clubfoot'), icon: '👣' }
  ];

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

  return (
    <>
      <Helmet>
        <title>{`${t('nav.about')} | ${t('meta.title')}`}</title>
      </Helmet>
      
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-600 text-white">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('about.title')}</h1>
          <p className="text-xl text-primary-100">{t('about.subtitle')}</p>
        </div>
      </div>
      
      {/* About Content */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Doctor Image */}
            <div className="lg:col-span-1" data-aos="fade-right">
              <div className="relative">
                <img 
                src="/img/aboutsection.webp"
                  alt="Op. Dr. Gürkan Eryanılmaz" 
                  className="rounded-lg shadow-lg w-full h-auto"
                />
                <div className="absolute -bottom-5 -right-5 bg-white p-4 rounded-lg shadow-lg">
                  <p className="text-xl font-semibold text-primary-600">Op. Dr.</p>
                  <p className="text-gray-800 font-medium">Gürkan Eryanılmaz</p>
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">{t('about.personal.title')}</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <span className="font-medium w-32">{t('about.personal.birthplace')}</span>
                    <span>İzmir, Turkey</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-32">{t('about.personal.birthdate')}</span>
                    <span>1969</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Social Media</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-primary-600 transition-colors"
                      aria-label={social.label}
                    >
                      <social.icon size={24} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Biography */}
            <div className="lg:col-span-2" data-aos="fade-left">
              <SectionHeading title={t('about.bio.title')} />
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">{t('about.bio.education')}</h3>
                <ul className="space-y-4">
                  <li>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="font-medium">{t('about.bio.egeUniversity')}</p>
                        <p className="text-gray-600">{t('about.bio.doctorOfMedicine')}</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="font-medium">{t('about.bio.tepecikHospital')}</p>
                        <p className="text-gray-600">{t('about.bio.orthopedicsResidency')}</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">{t('about.bio.experience')}</h3>
                <ul className="space-y-4">
                  <li>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="font-medium">{t('about.bio.mederaHospital')}</p>
                        <p className="text-gray-600">{t('about.bio.orthopedicsSpecialist')}</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="font-medium">{t('about.bio.afyonStateHospital')}</p>
                        <p className="text-gray-600">{t('about.bio.orthopedicsSpecialistAfyon')}</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="font-medium">{t('about.bio.balakanLankaran')}</p>
                        <p className="text-gray-600">{t('about.bio.consultingSurgeon')}</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Surgical Experience */}
              <div className="mb-8">
                <SectionHeading title={t('about.bio.surgicalExperience')} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-6 rounded-lg text-center"
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                    >
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-3xl font-bold mb-2">
                        <CounterAnimation end={stat.value} duration={2} />
                        <span className="text-xl">+</span>
                      </div>
                      <p className="text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-6">{t('services.specializations.title')}</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    <span>{t('services.specializations.arthroscopicSurgery')}</span>
                  </li>
                  <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    <span>{t('services.specializations.jointReplacements')}</span>
                  </li>
                  <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    <span>{t('services.specializations.fractureTraumaSurgery')}</span>
                  </li>
                  <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    <span>{t('services.specializations.pediatricOrthopedics')}</span>
                  </li>
                  <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    <span>{t('services.specializations.sportsRehab')}</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-12">
                <SectionHeading title={t('about.philosophy.title')} />
                <p className="text-gray-700 leading-relaxed">
                  {t('about.philosophy.content')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Clinic Information */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <SectionHeading 
            title={t('about.clinic.title')}
            centered={true}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div data-aos="fade-right">
              <p className="text-lg text-gray-700 mb-6">
                {t('about.clinic.content')}
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                  <p>{t('about.facilities.diagnosticEquipment')}</p>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                  <p>{t('about.facilities.surgicalFacilities')}</p>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                  <p>{t('about.facilities.rehabServices')}</p>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                  <p>{t('about.facilities.multilingualStaff')}</p>
                </li>
              </ul>
            </div>
            <div data-aos="fade-left">
              <img 
                src="/img/clinicpic.webp" 
                alt="Medera Hospital" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
