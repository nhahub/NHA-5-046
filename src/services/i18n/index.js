import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import arCommon from './locales/ar/common.json';
import enCommon from './locales/en/common.json';

export const SUPPORTED_LANGUAGES = Object.freeze(['en', 'ar']);

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    ar: { common: arCommon },
  },
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  defaultNS: 'common',
  ns: ['common'],
  interpolation: { escapeValue: false },
});

export { i18n };
