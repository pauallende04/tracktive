// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

// Obtiene el idioma desde localStorage, o usa 'en' como predeterminado si no hay ninguno almacenado
const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';

if (typeof window !== 'undefined') { // Solo en el cliente
  i18n
    .use(HttpBackend) // Backend para cargar archivos desde `public`
    .use(initReactI18next)
    .init({
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json', // Ruta de los archivos de traducción en `public`
      },
      lng: savedLanguage, // Configura el idioma inicial
      fallbackLng: 'en',
      ns: ['common'], // Namespace utilizado
      defaultNS: 'common', // Namespace por defecto
      interpolation: {
        escapeValue: false, // React ya maneja el escape para proteger de XSS
      },
      react: {
        useSuspense: false, // Desactiva Suspense para evitar problemas en el SSR de Next.js
      },
    });
}

export default i18n;
