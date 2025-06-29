import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'az', name: 'AZ', flag: '🇦🇿' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'tr', name: 'TR', flag: '🇹🇷' }
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languageLabels: { [key: string]: string } = {
    tr: 'TR',
    en: 'EN',
    az: 'AZ',
  };

  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
        aria-label="Change language"
      >
        <Globe size={20} />
        <span className="uppercase text-sm">{languageLabels[i18n.language.slice(0, 2)] || i18n.language.slice(0, 2).toUpperCase()}</span>
      </button>

      <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`w-full text-left px-4 py-2 text-sm ${
              i18n.language === lang.code ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => changeLanguage(lang.code)}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
