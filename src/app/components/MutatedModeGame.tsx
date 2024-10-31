import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Confetti from 'react-confetti';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

interface MutatedModeGameProps {
  selection: any[];
  fragments: number;
  duration: number;
  onExit: () => void;
}

const MutatedModeGame: React.FC<MutatedModeGameProps> = ({ 
  selection, 
  fragments, 
  duration, 
  onExit 
}) => {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const accessToken = (session as any)?.token?.access_token;
  const [track, setTrack] = useState<any>(null);
  const [playingIndex, setPlayingIndex] = useState<null | number>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isGuessedCorrectly, setIsGuessedCorrectly] = useState(false);
  const [playTimeoutId, setPlayTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [obfuscatedTitle, setObfuscatedTitle] = useState<string>(''); 
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [audioFragments, setAudioFragments] = useState<{ start: number; end: number }[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detección de dispositivo móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generateObfuscatedTitle = (title: string) => title.replace(/./g, '*');

  const shuffleArray = (array: any[]) => array.sort(() => Math.random() - 0.5);

  const savePlayedTrack = (trackId: string) => {
    const playedTracks = JSON.parse(localStorage.getItem('playedTracks') || '[]');
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const updatedTracks = [
      ...playedTracks.filter((item: any) => new Date(item.date).getTime() > oneWeekAgo),
      { id: trackId, date: new Date().toISOString() },
    ];
    localStorage.setItem('playedTracks', JSON.stringify(updatedTracks));
  };

  const loadNewTrack = async (availableTracks: any[]) => {
    setShowHint(false);
    if (availableTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTracks.length);
      const newTrack = availableTracks[randomIndex];
      setTrack(newTrack);
      const obfuscatedTitle = generateObfuscatedTitle(newTrack.name);
      setObfuscatedTitle(obfuscatedTitle);
      savePlayedTrack(newTrack.id);
      const fragmentDurations = Array.from({ length: fragments }).map(() => {
        const fragmentStart = Math.random() * (30 - duration);
        return { start: fragmentStart, end: fragmentStart + duration };
      });
      setAudioFragments(fragmentDurations);
      setIsGuessedCorrectly(false);
      setGuess('');

      if (playingIndex !== null) {
        const currentAudio = document.getElementById(`audio-fragment-${playingIndex}`) as HTMLAudioElement;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }
    } else {
      console.error(t('noSongsAvailable'));
    }
  };

  useEffect(() => {
    if (accessToken) {
      const fetchTracks = async () => {
        setIsLoadingTracks(true);
        let allTracks: any[] = [];
        const selectedPlaylists = selection.filter((item) => item.type === 'playlist');
        const selectedGenres = selection.filter((item) => item.type === 'genre');
        const selectedArtists = selection.filter((item) => item.type === 'artist');

        const totalGroups = [selectedPlaylists, selectedGenres, selectedArtists].filter((group) => group.length > 0).length;
        const tracksPerGroup = totalGroups > 0 ? Math.floor(150 / totalGroups) : 0;

        if (selectedPlaylists.length > 0) {
          for (const playlist of selectedPlaylists) {
            const playlistTracks = await fetchAllTracksFromPlaylist(playlist.id, accessToken);
            allTracks.push(...shuffleArray(playlistTracks).slice(0, tracksPerGroup));
          }
        }

        if (selectedGenres.length > 0) {
          const genreTracks = await fetchTracksFromGenres(
            selectedGenres.map((genre) => genre.id),
            tracksPerGroup,
            accessToken
          );
          allTracks.push(...genreTracks);
        }

        if (selectedArtists.length > 0) {
          const artistTracks = await fetchTracksFromArtists(
            selectedArtists.map((artist) => artist.id),
            tracksPerGroup,
            accessToken
          );
          allTracks.push(...artistTracks);
        }

        const shuffledAllTracks = shuffleArray(allTracks);
        setTracks(shuffledAllTracks);
        await loadNewTrack(shuffledAllTracks);
        setIsLoadingTracks(false);
      };

      fetchTracks();
    }
  }, [accessToken, selection]);

  const fetchAllTracksFromPlaylist = async (playlistId: string, accessToken: string) => {
    let allTracks: any[] = [];
    let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    let next = url;

    while (next) {
      const response = await axios.get(next, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      allTracks = [...allTracks, ...response.data.items.map((item: any) => item.track)];
      next = response.data.next;
    }

    return allTracks;
  };

  const fetchTracksFromGenres = async (genres: string[], limit: number, accessToken: string) => {
    const response = await axios.get('https://api.spotify.com/v1/recommendations', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        seed_genres: genres.join(','),
        limit,
      },
    });
    return response.data.tracks;
  };

  const fetchTracksFromArtists = async (artists: string[], limit: number, accessToken: string) => {
    let allTracks: any[] = [];
    for (const artist of artists) {
      const response = await axios.get(`https://api.spotify.com/v1/artists/${artist}/top-tracks`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          market: 'US',
        },
      });
      allTracks.push(...response.data.tracks.slice(0, limit / artists.length));
    }
    return allTracks;
  };

  const handlePlay = (index: number) => {
    if (!track || !track.preview_url) return;

    if (playingIndex !== null) {
      const currentAudio = document.getElementById(`audio-fragment-${playingIndex}`) as HTMLAudioElement;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      clearInterval(intervalId!);
    }

    setPlayingIndex(index);
    setTimeLeft(duration);

    const fragment = audioFragments[index];
    const audio = document.getElementById(`audio-fragment-${index}`) as HTMLAudioElement;

    audio.currentTime = fragment.start;
    audio.play();

    const newIntervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          audio.pause();
          clearInterval(newIntervalId);
          setPlayingIndex(null);
          return duration;
        }
        return prevTime - 1;
      });
    }, 1000);
    setIntervalId(newIntervalId);

    setTimeout(() => {
      audio.pause();
      clearInterval(newIntervalId);
      setPlayingIndex(null);
      setTimeLeft(duration);
    }, duration * 1000);
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGuess(value);
  
    if (value.length >= 3 && accessToken) {
      try {
        const response = await axios.get('https://api.spotify.com/v1/search', {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            q: value,
            type: 'track',
            limit: 3,
          },
        });
  
        setSuggestions(response.data.tracks.items);
      } catch (error) {
        console.error(t('errorSearchingSongs'));
      }
    } else {
      setSuggestions([]);
    }
  };

  const fillGuess = (selectedGuess: string) => {
    setGuess(selectedGuess);
    setSuggestions([]);
  };

  const checkGuess = async () => {
    const isCorrect = track?.name.toLowerCase() === guess.toLowerCase();
    setResult(isCorrect ? t("correct") : t("incorrect"));
    setIsGuessedCorrectly(isCorrect);
  
    if (isCorrect) {
      setGuess(''); 
      const newCurrentStreak = currentStreak + 1;
      setCurrentStreak(newCurrentStreak);
      if (newCurrentStreak > maxStreak) setMaxStreak(newCurrentStreak);
      playFullTrackFor30Seconds();
      
      setTimeout(() => {
        setResult('');
      }, 2000);
    } else {
      setCurrentStreak(0);
    }
  };

  const playFullTrackFor30Seconds = () => {
    const audio = document.getElementById('audio-full') as HTMLAudioElement;
    if (audio) {
      if (playTimeoutId) clearTimeout(playTimeoutId);

      audio.currentTime = 0;
      audio.play();

      const timeoutId = setTimeout(() => {
        audio.pause();
      }, 30000);
      setPlayTimeoutId(timeoutId);
    }
  };

  if (isLoadingTracks) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-green-100 fixed top-0 left-0 z-50">
        <p className="text-2xl font-semibold text-gray-600 animate-pulse">{t('loadingTracks')}...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('moddedMode')} - Tracktive</title>
        <meta name="description" content={t('description')} />
      </Head>
      <div className={`flex flex-col items-center min-h-screen bg-green-100 pt-16 ${isMobile ? 'px-4' : ''}`}>
        {isGuessedCorrectly && <Confetti />}
        
        <div className="mb-10">
          <h2
            style={{
              fontSize: track?.name?.length > 20 ? '1.5rem' : '2rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
            className={`font-bold mb-4 transition-all duration-700 ease-in-out transform ${
              isGuessedCorrectly ? 'scale-110 opacity-90' : 'filter blur-lg'
            } ${isMobile ? 'text-center' : ''}`}
          >
            {isGuessedCorrectly ? track.name : obfuscatedTitle}
          </h2>
        </div>

        {track && (
          <div className={`mb-4 ${isMobile ? 'flex-col items-center space-y-4' : ''}`}>
            {Array.from({ length: fragments }).map((_, index) => (
              <div key={index} className={`flex items-center mb-4 ${isMobile ? 'w-full' : ''}`}>
                <audio id={`audio-fragment-${index}`} src={track.preview_url} preload="auto" />
                <button
                  onClick={() => handlePlay(index)}
                  className={`bg-green-500 text-white px-4 py-2 rounded-full shadow-md ${
                    isMobile ? 'w-full' : 'w-auto'
                  }`}
                >
                  {playingIndex === index ? `${timeLeft} ${t('remainingTime')}` : `${t('trackSegment')} ${index + 1}`}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-8 w-64 flex flex-col items-center space-y-2">
          <input
            type="text"
            value={guess}
            onChange={handleSearchChange}
            placeholder={t("guessPlaceholder")}
            className="border rounded-md px-4 py-2 w-full"
          />

          {suggestions.length > 0 && (
            <div className="mt-2 bg-white border rounded-md shadow-lg w-full max-h-40 overflow-y-auto">
              {suggestions.map((suggestion: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => fillGuess(suggestion.name)}
                  className="flex items-center space-x-3 px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <img
                    src={suggestion.album.images[0]?.url}
                    alt="Album cover"
                    className="w-10 h-10 rounded-full"
                  />
                  <span>{suggestion.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-2 w-full mt-2">
            <button onClick={checkGuess} className={`bg-blue-500 text-white px-4 py-2 rounded ${isMobile ? 'w-full' : 'w-3/4'}`}>
              {t('play')}
            </button>
            <button
              onClick={() => setShowHint(!showHint)}
              className={`bg-yellow-400 text-white p-2 rounded flex items-center justify-center ${
                isMobile ? 'w-full' : 'w-1/4'
              } transition-all duration-300 hover:w-1/2`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" />
                <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
                <path d="M9.7 17l4.6 0" />
              </svg>
            </button>
          </div>
        </div>

        {showHint && track && (
          <div className="flex justify-center items-center mt-4">
            <img src={track.album.images[0]?.url} alt="Album cover" className="w-32 h-32 rounded-md shadow-lg" />
          </div>
        )}

        {result && <p className={`text-lg font-semibold ${result === t("correct") ? "text-green-500" : "text-red-500"}`}>{result}</p>}

        <div className="flex space-x-4 mt-8">
          {isGuessedCorrectly ? (
            <button
              onClick={() => {
                setIsGuessedCorrectly(false);
                setShowHint(false);
                setResult('');
                loadNewTrack(tracks);
              }}
              className={`bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-yellow-600 transition ${isMobile ? 'w-full' : ''}`}
            >
              {t('nextSong')}
            </button>
          ) : (
            <button
              onClick={() => {
                setShowHint(false);
                setResult('');
                loadNewTrack(tracks);
                setGuess('');
                setIsGuessedCorrectly(false);
              }}
              className={`bg-gray-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-600 transition ${isMobile ? 'w-full' : ''}`}
            >
              {t('skip')}
            </button>
          )}

          {isGuessedCorrectly && (
            <button
              onClick={() => { onExit(); }}
              className={`bg-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-600 transition ${isMobile ? 'w-full' : ''}`}
            >
              {t('exit')}
            </button>
          )}
        </div>

        {track && (
          <audio id="audio-full" src={track.preview_url} preload="auto" />
        )}
      </div>
    </>
  );
};

export default MutatedModeGame;
