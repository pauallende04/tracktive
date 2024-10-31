import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getTopTracks } from '../utils/spotify';
import axios from 'axios';
import Confetti from 'react-confetti';

const ArtistModeGame = ({
  fragments,
  duration,
  onExit,
}: {
  fragments: number;
  duration: number;
  onExit: () => void;
}) => {
  const { data: session } = useSession();
  const accessToken = (session as any)?.token?.access_token;
  const countryCode = "ES";
  const [track, setTrack] = useState<any>(null);
  const [playingIndex, setPlayingIndex] = useState<null | number>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isGuessedCorrectly, setIsGuessedCorrectly] = useState(false);
  const [playTimeoutId, setPlayTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si estamos en un dispositivo móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const savePlayedTrack = (trackId: string) => {
    const playedTracks = JSON.parse(localStorage.getItem('playedTracks') || '[]');
    const updatedTracks = [...playedTracks, { id: trackId, date: new Date().toISOString() }];
    localStorage.setItem('playedTracks', JSON.stringify(updatedTracks));
  };

  const loadNewTrack = async () => {
    if (!accessToken) return;
    const playedTracks = JSON.parse(localStorage.getItem('playedTracks') || '[]').map((item: any) => item.id);
    let trackData = await getTopTracks(accessToken, countryCode);
    trackData = trackData.filter((item: any) => !playedTracks.includes(item.track.id));

    if (trackData.length > 0) {
      const newTrack = trackData[Math.floor(Math.random() * trackData.length)];
      setTrack(newTrack);
      savePlayedTrack(newTrack.track.id);
      setIsGuessedCorrectly(false);
      setGuess('');
    } else {
      console.error('No hay canciones disponibles.');
    }
  };

  useEffect(() => {
    loadNewTrack();
  }, [accessToken]);

  const handlePlay = (index: number) => {
    if (!track || !track.track.preview_url) return;

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

    const audio = document.getElementById(`audio-fragment-${index}`) as HTMLAudioElement;
    audio.currentTime = Math.floor(Math.random() * Math.max(0, audio.duration - duration));
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
            type: 'artist',
            limit: 3,
          },
        });
        setSuggestions(response.data.artists.items);
      } catch (error) {
        console.error('Error en la búsqueda de artistas:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const checkGuess = () => {
    const correctArtists = track?.track?.artists.map((artist: any) => artist.name.toLowerCase()) || [];
    const isCorrect = correctArtists.includes(guess.toLowerCase());
    setResult(isCorrect ? "¡Correcto!" : "Incorrecto, intenta otra vez.");
    setIsGuessedCorrectly(isCorrect);

    if (isCorrect) playFullTrackFor30Seconds();
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

  return (
    <div className={`flex flex-col items-center min-h-screen bg-green-100 pt-16 ${isMobile ? 'p-4' : 'p-8'}`}>
      {isGuessedCorrectly && <Confetti />}
      
      <div className="mb-10">
        <h2
          style={{
            fontSize: track?.track?.name?.length > 20 ? '1.5rem' : '2rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
          className={`font-bold mb-4 transition-all duration-700 ease-in-out ${isGuessedCorrectly ? 'scale-110 opacity-90' : 'filter blur-lg'}`}
        >
          {isGuessedCorrectly ? track.track.name : track?.track.name.replace(/./g, '*')}
        </h2>
      </div>

      {track && (
        <div className="mb-4">
          {Array.from({ length: fragments }).map((_, index) => (
            <div key={index} className="flex items-center mb-4">
              <audio id={`audio-fragment-${index}`} src={track.track.preview_url} preload="auto" />
              <button
                onClick={() => handlePlay(index)}
                className={`bg-green-500 text-white px-4 py-2 rounded-full shadow-md ${isMobile ? 'w-full' : ''}`}
              >
                {playingIndex === index ? `${timeLeft} s restantes` : `Fragmento ${index + 1}`}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`mb-8 w-full flex flex-col items-center space-y-2 ${isMobile ? 'max-w-xs' : 'w-64'}`}>
        <input
          type="text"
          value={guess}
          onChange={handleSearchChange}
          placeholder="Buscar canción..."
          className="border rounded-md px-4 py-2 w-full"
        />

        {suggestions.length > 0 && (
          <div className="mt-2 bg-white border rounded-md shadow-lg w-full max-h-40 overflow-y-auto">
            {suggestions.map((suggestion: any, idx: number) => (
              <div
                key={idx}
                onClick={() => setGuess(suggestion.name)}
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
          <button onClick={checkGuess} className="bg-blue-500 text-white px-4 py-2 rounded w-3/4">
            Adivinar
          </button>
          <button
            onClick={() => setShowHint(!showHint)}
            className="bg-yellow-400 text-white p-2 rounded flex items-center justify-center w-1/4 transition-all duration-300 hover:w-1/2"
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
          <img src={track.track.album.images[0]?.url} alt="Album cover" className="w-32 h-32 rounded-md shadow-lg" />
        </div>
      )}

      {result && <p className={`text-lg font-semibold ${result === "¡Correcto!" ? "text-green-500" : "text-red-500"}`}>{result}</p>}

      <div className="flex space-x-4 mt-8">
        {isGuessedCorrectly ? (
          <button
            onClick={() => {
              setIsGuessedCorrectly(false);
              setShowHint(false);
              setResult('');
              loadNewTrack();
            }}
            className={`bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-yellow-600 transition ${isMobile ? 'w-full' : ''}`}
          >
            Siguiente canción
          </button>
        ) : (
          <button
            onClick={() => {
              setShowHint(false);
              setResult('');
              loadNewTrack();
              setGuess('');
              setIsGuessedCorrectly(false);
            }}
            className={`bg-gray-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-600 transition ${isMobile ? 'w-full' : ''}`}
          >
            Saltar
          </button>
        )}

        {isGuessedCorrectly && (
          <button
            onClick={() => { onExit(); }}
            className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-600 transition"
          >
            Salir
          </button>
        )}
      </div>

      {track && (
        <audio id="audio-full" src={track.track.preview_url} preload="auto" />
      )}
    </div>
  );
};

export default ArtistModeGame;
