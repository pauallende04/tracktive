"use client";

import React, { useState, useEffect, useRef } from 'react';
import './i18n';
import { useSession, signIn } from 'next-auth/react';
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
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [gameMode, setGameMode] = useState<"classic" | "artist" | "mutated" | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [fragments, setFragments] = useState(3);
  const [duration, setDuration] = useState(5);
  const [mutatedSelection, setMutatedSelection] = useState<any[]>([]);
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
    if (!i18n.isInitialized) {
      i18n.on('initialized', () => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [i18n]);

  useEffect(() => {
    if (gameMode || isGameStarted) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [gameMode, isGameStarted]);

  const accuracy = totalGuesses > 0 ? ((correctGuesses / totalGuesses) * 100).toFixed(2) : "0.00";

  const handleStartConfig = (mode: "classic" | "artist" | "mutated") => {
    setGameMode(mode);
    setIsGameStarted(false);
  };

  const handleStartGame = (selectedFragments: number, selectedDuration: number) => {
    setFragments(selectedFragments);
    setDuration(selectedDuration);
    setIsGameStarted(true);
  };

  const handleStartMutatedGame = (selection: any[], selectedFragments: number, selectedDuration: number) => {
    setMutatedSelection(selection);
    setFragments(selectedFragments);
    setDuration(selectedDuration);
    setIsGameStarted(true);
  };

  const handleExit = () => {
    setGameMode(null);
    setIsGameStarted(false);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-green-100">
        <p className="text-2xl font-semibold text-gray-600 animate-pulse">Tracktive...</p>
      </div>
    );
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

      <div className="bg-green-100 min-h-screen flex flex-col pt-28">
        <nav className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white fixed top-0 w-full z-50 shadow-lg">
          <div className="flex items-center relative">
            {status === "authenticated" ? (
              <>
                <img
                  src={session?.user?.image || '/default-profile.png'}
                  alt={t("profileAlt")}
                  className="w-10 h-10 rounded-full cursor-pointer"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                />
                <span className="ml-2 cursor-pointer font-semibold">{session.user?.name}</span>
                {country && <span className="ml-2 text-xl">{getFlagEmoji(country)}</span>}
                <span className="ml-4 text-xl">🔥{currentStreak}</span>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="bg-blue-500 px-4 py-2 rounded-md text-white hover:bg-blue-600 transition-colors"
              >
                {t("signInWithSpotify")}
              </button>
            )}
          </div>

          {/* Language and Mode Switcher */}
          <LanguageSwitcher 
            isAuthenticated={status === "authenticated"} 
            onGameModeChange={handleStartConfig} 
            gameMode={gameMode}
            onExit={handleExit}
          />
        </nav>

        {gameMode && isGameStarted ? (
          <div className="mt-20">
            {gameMode === "classic" ? (
              <ClassicModeGame fragments={fragments} duration={duration} onExit={handleExit} />
            ) : gameMode === "artist" ? (
              <ArtistModeGame fragments={fragments} duration={duration} onExit={handleExit} />
            ) : (
              <MutatedModeGame selection={mutatedSelection} fragments={fragments} duration={duration} onExit={handleExit} />
            )}
          </div>
        ) : gameMode ? (
          <div className="mt-20">
            {gameMode === "classic" ? (
              <ClassicModeConfig onStartGame={handleStartGame} />
            ) : gameMode === "artist" ? (
              <ArtistModeConfig onStartGame={handleStartGame} />
            ) : (
              <MutatedModeConfig onStartGame={handleStartMutatedGame} />
            )}
          </div>
        ) : (
          <div className="flex flex-1 justify-center items-center px-4 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-screen-md">
              {[
                { mode: "classic", label: t("classicMode"), bg: "bg-blue-500" },
                { mode: "artist", label: t("artistChallenge"), bg: "bg-purple-500" },
                { mode: "mutated", label: t("moddedMode"), bg: "bg-teal-500" },
              ].map(({ mode, label, bg }) => (
                <div
                  key={mode}
                  onClick={() => handleStartConfig(mode as "classic" | "artist" | "mutated")}
                  className={`${bg} p-8 rounded-lg shadow-lg cursor-pointer transform transition duration-500 ease-in-out hover:scale-105 text-white hover:bg-opacity-90`}
                >
                  <h3 className="text-2xl font-bold transform transition duration-300 ease-in-out hover:scale-110">{label}</h3>
                  <p className="mt-4 text-sm text-gray-100">{t(`${mode}Description`)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
