import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Analytics } from '@vercel/analytics/react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import SymptomsPage from './pages/SymptomsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import TestimonialsPage from './pages/TestimonialsPage';
import ContactPage from './pages/ContactPage';
import GalleryPage from './pages/GalleryPage';
import CheckAppointmentsPage from './pages/CheckAppointmentsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Symptom Pages
import ShoulderPainPage from './pages/symptoms/ShoulderPainPage';
import ElbowConditionsPage from './pages/symptoms/ElbowConditionsPage';
import WristHandPage from './pages/symptoms/WristHandPage';
import HipProblemsPage from './pages/symptoms/HipProblemsPage';
import KneeConditionsPage from './pages/symptoms/KneeConditionsPage';
import FootAnklePage from './pages/symptoms/FootAnklePage';
import PediatricOrthopedicsPage from './pages/symptoms/PediatricOrthopedicsPage';

// Data
import { services } from './data/services';

const supportedLanguages = ['tr', 'en', 'az'];

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language.slice(0, 2).toLowerCase();
    if (!supportedLanguages.includes(lang)) {
      i18n.changeLanguage('tr'); // fallback
    } else {
      i18n.changeLanguage(lang);
    }

    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out',
    });

    // Update document direction based on language
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n]);

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          {services.map((service) => (
            <Route
              key={service.id}
              path={`services/${service.slug}`}
              element={<ServiceDetailPage serviceId={service.id} />}
            />
          ))}
          <Route path="symptoms" element={<SymptomsPage />} />
          <Route path="symptoms/shoulder-pain" element={<ShoulderPainPage />} />
          <Route path="symptoms/elbow-conditions" element={<ElbowConditionsPage />} />
          <Route path="symptoms/wrist-hand" element={<WristHandPage />} />
          <Route path="symptoms/hip-problems" element={<HipProblemsPage />} />
          <Route path="symptoms/knee-conditions" element={<KneeConditionsPage />} />
          <Route path="symptoms/foot-ankle" element={<FootAnklePage />} />
          <Route path="symptoms/pediatric-orthopedics" element={<PediatricOrthopedicsPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="appointments" element={<CheckAppointmentsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>

      {/* ✅ Add Vercel Analytics */}
      <Analytics />
    </>
  );
}

export default App;