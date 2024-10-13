// src/app/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import './i18n';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useUserCountry } from './hooks/useUserCountry';
import { getFlagEmoji } from './utils/flags';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import ClassicModeConfig from './components/ClassicModeConfig';
import ClassicModeGame from './components/ClassicModeGame';
import { getUserStreak } from './utils/streaks';

// Hook para verificar el tamaño de la pantalla
const useMediaQuery = (width: number) => {
  const [isMatch, setIsMatch] = useState(false);
  useEffect(() => {
    const updateMatch = () => setIsMatch(window.innerWidth < width);
    window.addEventListener("resize", updateMatch);
    updateMatch();
    return () => window.removeEventListener("resize", updateMatch);
  }, [width]);
  return isMatch;
};

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const { data: session, status } = useSession();
  const country = useUserCountry();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Para el menú móvil
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [isClassicMode, setIsClassicMode] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [fragments, setFragments] = useState(3);
  const [duration, setDuration] = useState(5);
  const menuRef = useRef<HTMLDivElement>(null);

  // Detectar si el ancho de pantalla es menor a 640px (mobile-first)
  const isMobile = useMediaQuery(640);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (session?.user?.email) {
        const { currentStreak, maxStreak, totalGuesses, correctGuesses } = await getUserStreak(session.user.email);
        setCurrentStreak(currentStreak);
        setMaxStreak(maxStreak);
        setTotalGuesses(totalGuesses || 0);
        setCorrectGuesses(correctGuesses || 0);
      }
    };
    if (status === "authenticated") fetchUserStats();
  }, [session, status]);

  const accuracy = totalGuesses > 0 ? ((correctGuesses / totalGuesses) * 100).toFixed(2) : "0.00";

  const handleStartConfig = () => {
    setIsClassicMode(true);
    setIsGameStarted(false);
  };

  const handleStartGame = (selectedFragments: number, selectedDuration: number) => {
    setFragments(selectedFragments);
    setDuration(selectedDuration);
    setIsGameStarted(true);
  };

  const handleExit = () => {
    setIsClassicMode(false);
    setIsGameStarted(false);
  };

  // Cerrar el menú al hacer clic fuera del menú en modo móvil
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMobile) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-green-100 min-h-screen flex flex-col">
      <nav className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white">
        {isMobile ? (
          <>
            <span className="text-lg font-bold">Tracktive</span>
            {/* Menú móvil */}
            <div className="relative" ref={menuRef}>
              <img
                src={session?.user?.image || '/default-profile.png'}
                alt="User profile"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10">
                  <div className="py-2 text-gray-700 text-sm sm:text-base">
                    {/* Información del usuario */}
                    {status === "authenticated" && (
                      <>
                        <p className="px-4 py-2 font-semibold">{session.user?.name}</p>
                        <p className="px-4 py-2 font-semibold">🔥 Racha: {currentStreak}</p>
                        <p className="px-4 py-2 font-semibold">Racha Máxima: {maxStreak}</p>
                        <p className="px-4 py-2 font-semibold">País: {country ? getFlagEmoji(country) : "Desconocido"}</p>
                        <p className="px-4 py-2 font-semibold">Aciertos: {accuracy}%</p>
                      </>
                    )}

                    {/* Modos de juego */}
                    <div className="border-t mt-2">
                      <button onClick={handleStartConfig} className="block px-4 py-2 text-left w-full hover:bg-gray-100">
                        {t('classicMode')}
                      </button>
                      <button className="block px-4 py-2 text-left w-full hover:bg-gray-100">
                        {t('dailyChallenge')}
                      </button>
                      <button className="block px-4 py-2 text-left w-full hover:bg-gray-100">
                        {t('moddedMode')}
                      </button>
                    </div>

                    {/* Selección de idioma */}
                    <div className="border-t mt-2">
                      <button onClick={() => changeLanguage('es')} className="block px-4 py-2 text-left w-full hover:bg-gray-100">
                        Español
                      </button>
                      <button onClick={() => changeLanguage('en')} className="block px-4 py-2 text-left w-full hover:bg-gray-100">
                        English
                      </button>
                    </div>

                    {/* Cerrar sesión */}
                    {status === "authenticated" && (
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-red-500 text-center mt-2 py-2 hover:bg-gray-100"
                      >
                        Cerrar sesión
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Diseño de escritorio */}
            <div className="flex items-center relative">
              {status === "authenticated" ? (
                <>
                  <img
                    src={session.user?.image || '/default-profile.png'}
                    alt="User profile"
                    className="w-10 h-10 rounded-full mr-3 cursor-pointer"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  />
                  <span onClick={() => setIsProfileOpen(!isProfileOpen)} className="mr-2 cursor-pointer">
                    {session.user?.name}
                  </span>
                  {country && <span>{getFlagEmoji(country)}</span>}
                  <span className="ml-2 text-xl">🔥{currentStreak}</span>

                  {isProfileOpen && (
                    <div className="absolute top-full mt-2 w-64 bg-white rounded-md shadow-lg z-10">
                      <div className="py-2">
                        <p className="px-4 py-2 text-gray-700 font-semibold">Racha Actual: {currentStreak}</p>
                        <p className="px-4 py-2 text-gray-700 font-semibold">Racha Máxima: {maxStreak}</p>
                        <p className="px-4 py-2 text-gray-700 font-semibold">País: {country || "Desconocido"}</p>
                        <p className="px-4 py-2 text-gray-700 font-semibold">Aciertos: {accuracy}%</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="bg-blue-500 px-4 py-2 rounded-md text-white hover:bg-blue-600"
                >
                  Iniciar sesión
                </button>
              )}
            </div>

            <div className="flex-grow text-center">
              <button onClick={handleStartConfig} className="ml-2 mr-4 text-lg font-medium">
                {t('classicMode')}
              </button>
              <button className="ml-2 mr-4 text-lg font-medium">{t('dailyChallenge')}</button>
              <button className="ml-2 mr-4 text-lg font-medium">{t('moddedMode')}</button>
            </div>
            <LanguageSwitcher isAuthenticated={status === "authenticated"} />
          </>
        )}
      </nav>

      {isClassicMode ? (
        isGameStarted ? (
          <ClassicModeGame fragments={fragments} duration={duration} onExit={handleExit} />
        ) : (
          <ClassicModeConfig onStartGame={handleStartGame} />
        )
      ) : (
        <div className="flex flex-1 p-4 gap-4 max-w-screen-xl w-full mx-auto">
          {/* Contenido principal */}
        </div>
      )}
    </div>
  );
};

export default HomePage;
