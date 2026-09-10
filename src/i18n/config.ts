import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import es from './locales/es.json';
import portafolioEn from './locales/portafolio.en.json';
import portafolioEs from './locales/portafolio.es.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: { ...en, portafolio: portafolioEn }
      },
      es: {
        translation: { ...es, portafolio: portafolioEs }
      }
    },
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
