'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { signOut, signIn } from 'next-auth/react';

const LanguageSwitcher = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = async (lng: string) => {
    if (i18n && i18n.changeLanguage) {
      await i18n.changeLanguage(lng);
      localStorage.setItem('language', lng);
      setIsOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="flex items-center p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <p className="px-4 py-2 text-gray-700 font-semibold">{t('selectLanguage')}</p>
            <button
              onClick={() => changeLanguage('es')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Español
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              English
            </button>
          </div>
          <hr className="my-2" />
          {isAuthenticated ? (
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          ) : (
            <button
              onClick={() => signIn()}
              className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
            >
              Iniciar sesión
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
