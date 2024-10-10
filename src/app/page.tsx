// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import './i18n';
import { useSession, signIn } from 'next-auth/react';
import { useUserCountry } from './hooks/useUserCountry';
import { getFlagEmoji } from './utils/flags';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import ClassicModeConfig from './components/ClassicModeConfig';
import ClassicModeGame from './components/ClassicModeGame';

const HomePage: React.FC = () => {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const country = useUserCountry();

  const [isClassicMode, setIsClassicMode] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [fragments, setFragments] = useState(3);
  const [duration, setDuration] = useState(5);

  const handleStartConfig = () => {
    setIsClassicMode(true);
    setIsGameStarted(false);
  };

  const handleStartGame = (selectedFragments: number, selectedDuration: number) => {
    setFragments(selectedFragments);
    setDuration(selectedDuration);
    setIsGameStarted(true);
  };

  if (status === 'loading') {
    return (
      <div className="loading-screen flex items-center justify-center min-h-screen bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">
        <div className="flex">
          <span className="text-5xl font-bold text-white animate-pulse">Tracktive</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-100 min-h-screen flex flex-col">
      <nav className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white">
        <div className="flex items-center">
          {session && (
            <>
              <img
                src={session.user?.image || '/default-profile.png'}
                alt="User profile"
                className="w-10 h-10 rounded-full mr-3"
              />
              <span className="mr-2">{session.user?.name}</span>
              {country && <span>{getFlagEmoji(country)}</span>}
            </>
          )}
        </div>
        <div className="flex-grow text-center">
          <button 
            onClick={handleStartConfig} 
            className="ml-2 mr-4 text-lg font-medium"
          >
            {t('classicMode')}
          </button>
          <button className="ml-2 mr-4 text-lg font-medium">{t('dailyChallenge')}</button>
          <button className="ml-2 mr-4 text-lg font-medium">{t('moddedMode')}</button>
        </div>
        <LanguageSwitcher />
      </nav>

      {/* Interfaz del Modo Clásico */}
      {isClassicMode ? (
        isGameStarted ? (
          <ClassicModeGame fragments={fragments} duration={duration} />
        ) : (
          <ClassicModeConfig onStartGame={handleStartGame} />
        )
      ) : (
        // Pantalla de inicio original
        <div className="flex flex-1 p-4 gap-4 max-w-screen-xl w-full mx-auto">
          {/* Cuadro 1: Información de la web */}
          <div className="flex-1 bg-white shadow-lg rounded-md p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('webInfoTitle')}</h2>
            <p>{t('webInfoContent')}</p>
          </div>

          {/* Cuadro 2: Cómo se juega */}
          <div className="flex-1 bg-white shadow-lg rounded-md p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('howToPlayTitle')}</h2>
            <p>{t('howToPlayContent')}</p>
            {!session && (
              <div className="flex items-center justify-center py-8">
                <button
                  onClick={() => signIn('spotify')}
                  className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-400 transition"
                >
                  {t('signInWithSpotify')}
                </button>
              </div>
            )}
          </div>

          {/* Cuadro 3: Noticias y Actualizaciones */}
          <div className="flex-1 bg-white shadow-lg rounded-md p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('updatesTitle')}</h2>
            <p>{t('updatesContent')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
