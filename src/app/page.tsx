"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import './i18n';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useUserCountry } from './hooks/useUserCountry';
import { getFlagEmoji } from './utils/flags';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import ClassicModeConfig from './components/ClassicModeConfig';
import ClassicModeGame from './components/ClassicModeGame';
import ArtistModeConfig from './components/ArtistModeConfig';
import ArtistModeGame from './components/ArtistModeGame';
import MutatedModeConfig from './components/MutatedModeConfig';
import MutatedModeGame from './components/MutatedModeGame';
import { getUserStreak } from './utils/streaks';
import Head from 'next/head';

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
  const [gameMode, setGameMode] = useState<"classic" | "artist" | "mutated" | null>(null); // Manejar modo de juego
  const [isGameStarted, setIsGameStarted] = useState(false); // Estado general del juego
  const [fragments, setFragments] = useState(3);
  const [duration, setDuration] = useState(5);
  const [mutatedSelection, setMutatedSelection] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery(640);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    // Esperar hasta que las traducciones estén listas
    if (!i18n.isInitialized) {
      i18n.on('initialized', () => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false); // Ya están inicializadas
    }
  }, [i18n]);

  const accuracy = totalGuesses > 0 ? ((correctGuesses / totalGuesses) * 100).toFixed(2) : "0.00";

  const handleStartConfig = () => {
    setGameMode("classic");
    setIsGameStarted(false);
  };

  const handleStartArtistConfig = () => {
    setGameMode("artist");
    setIsGameStarted(false);
  };

  const handleStartMutatedConfig = () => {
    setGameMode("mutated");
    setIsGameStarted(false);
  };

  const handleStartGame = (selectedFragments: number, selectedDuration: number) => {
    setFragments(selectedFragments);
    setDuration(selectedDuration);
    setIsGameStarted(true);
  };

  const handleStartMutatedGame = (selection: any[], selectedFragments: number, selectedDuration: number) => {
    console.log('Selección recibida en page.tsx:', selection); // Agregar un log para verificar la selección
    setMutatedSelection(selection);
    setFragments(selectedFragments);
    setDuration(selectedDuration);
    setIsGameStarted(true);
  };
  

  const handleExit = () => {
    setGameMode(null); // Salir de cualquier modo de juego
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t('loading')}...</p>
      </div>
    ); // Puedes mejorar este loader como desees
  }

  return (
    <>
      <Head>
        <title>{t("webTitle")}</title>
        <meta name="description" content={t("webDescription")} />
        <meta property="og:title" content={t("webTitle")} />
        <meta property="og:description" content={t("webDescription")} />
        <meta property="og:image" content="/static/tracktive-preview.jpg" />
        <meta property="og:url" content="https://tracktive-kappa.vercel.app" />
        <meta name="twitter:title" content={t("webTitle")} />
        <meta name="twitter:description" content={t("webDescription")} />
        <meta name="twitter:image" content="/static/tracktive-preview.jpg" />
      </Head>

      <div className="bg-green-100 min-h-screen flex flex-col">
        <nav className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white">
          {isMobile ? (
            <>
              <span className="text-lg font-bold">Tracktive</span>
              <div className="relative" ref={menuRef}>
                <img
                  src={session?.user?.image || '/default-profile.png'}
                  alt={t("profileAlt")}
                  className="w-10 h-10 rounded-full cursor-pointer"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10">
                    {/* contenido del menú móvil */}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center relative">
                {status === "authenticated" ? (
                  <>
                    <img
                      src={session.user?.image || '/default-profile.png'}
                      alt={t("profileAlt")}
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
                          {/* Detalles del perfil */}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => signIn()}
                    className="bg-blue-500 px-4 py-2 rounded-md text-white hover:bg-blue-600"
                  >
                    {t("signInWithSpotify")}
                  </button>
                )}
              </div>

              <div className="flex-grow text-center">
                <button onClick={handleStartConfig} className="ml-2 mr-4 text-lg font-medium">
                  {t("classicMode")}
                </button>
                <button onClick={handleStartArtistConfig} className="ml-2 mr-4 text-lg font-medium">
                  {t("artistChallenge")}
                </button>
                <button onClick={handleStartMutatedConfig} className="ml-2 mr-4 text-lg font-medium">
                  {t("moddedMode")}
                </button>
              </div>
              <LanguageSwitcher isAuthenticated={status === "authenticated"} />
            </>
          )}
        </nav>

        {/* Renderizar el modo de juego correspondiente */}
        {gameMode === "classic" ? (
          isGameStarted ? (
            <ClassicModeGame fragments={fragments} duration={duration} onExit={handleExit} />
          ) : (
            <ClassicModeConfig onStartGame={handleStartGame} />
          )
        ) : gameMode === "artist" ? (
          isGameStarted ? (
            <ArtistModeGame fragments={fragments} duration={duration} onExit={handleExit} />
          ) : (
            <ArtistModeConfig onStartGame={handleStartGame} />
          )
        ) : gameMode === "mutated" ? (
          isGameStarted ? (
            <MutatedModeGame selection={mutatedSelection} fragments={fragments} duration={duration} onExit={handleExit} />
          ) : (
            <MutatedModeConfig onStartGame={handleStartMutatedGame} />
          )
        ) : (
          <div className="flex flex-1 p-4 gap-4 max-w-screen-xl w-full mx-auto">
            {/* Contenido principal */}
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
