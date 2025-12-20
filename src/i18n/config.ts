import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esTranslations from './locales/es';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: esTranslations
      }
    },
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;