import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const AdminLanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Store language preference in localStorage
    localStorage.setItem('adminLanguage', lng);
  };

  // Initialize language from localStorage on component mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('adminLanguage');
    if (savedLanguage && ['en', 'tr'].includes(savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
    } else {
      // Default to English for admin panel
      i18n.changeLanguage('en');
      localStorage.setItem('adminLanguage', 'en');
    }
  }, [i18n]);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="Change language"
      >
        <Globe size={18} />
        <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.name}</span>
      </button>

      <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
              i18n.language === lang.code ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'
            }`}
            onClick={() => changeLanguage(lang.code)}
          >
            <span className="mr-3">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminLanguageSwitcher;