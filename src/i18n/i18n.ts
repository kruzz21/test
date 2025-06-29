import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import azTranslation from './locales/az/translation.json';
import enTranslation from './locales/en/translation.json';
import trTranslation from './locales/tr/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'tr',
    supportedLngs: ['az', 'en', 'tr'],
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    resources: {
      az: {
        translation: azTranslation
      },
      en: {
        translation: enTranslation
      },
      tr: {
        translation: trTranslation
      }
    },
  });

export default i18n;
