import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ko from './locales/ko.json';
import sw from './locales/sw.json';
import fr from './locales/fr.json';
import ne from './locales/ne.json';
import uz from './locales/uz.json';

const resources = {
  en: {
    translation: en
  },
  ko: {
    translation: ko
  },
  sw: {
    translation: sw
  },
  fr: {
    translation: fr
  },
  ne: {
    translation: ne
  },
  uz: {
    translation: uz
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ko', 'sw', 'fr', 'ne', 'uz'],
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    
    react: {
      useSuspense: true
    }
  });

// Log initialization
i18n.on('initialized', () => {
  console.log('i18n initialized successfully');
  console.log('Current language:', i18n.language);
  console.log('Available languages:', i18n.languages);
  console.log('Resources loaded:', Object.keys(i18n.store.data));
});

export default i18n;