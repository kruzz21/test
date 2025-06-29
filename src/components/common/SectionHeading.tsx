import { useTranslation } from 'react-i18next';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

const SectionHeading = ({ title, subtitle, centered = false, light = false }: SectionHeadingProps) => {
  return (
    <div className={`mb-10 ${centered ? 'text-center' : ''}`} data-aos="fade-up">
      <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${light ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg ${light ? 'text-gray-300' : 'text-gray-600'}`}>
          {subtitle}
        </p>
      )}
      <div className={`h-1 w-20 bg-primary-500 mt-4 ${centered ? 'mx-auto' : ''}`}></div>
    </div>
  );
};

export default SectionHeading;