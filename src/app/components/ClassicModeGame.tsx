import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getTopTracks } from '../utils/spotify';
import { getUserStreak, updateUserStreak } from '../utils/streaks';
import axios from 'axios';
import Confetti from 'react-confetti';
import Head from 'next/head';


const ClassicModeGame = ({
  fragments,
  duration,
  onExit,
}: {
  fragments: number;
  duration: number;
  onExit: () => void;
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.email || '';
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
  const [obfuscatedTitle, setObfuscatedTitle] = useState<string>(''); 
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (userId) {
        const { currentStreak, maxStreak } = await getUserStreak(userId);
        setCurrentStreak(currentStreak);
        setMaxStreak(maxStreak);
      }
    };
    fetchUserStats();
  }, [userId]);

  const generateObfuscatedTitle = (title: string) => title.replace(/./g, '*');

  const savePlayedTrack = (trackId: string) => {
    const playedTracks = JSON.parse(localStorage.getItem('playedTracks') || '[]');
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const updatedTracks = [
      ...playedTracks.filter((item: any) => new Date(item.date).getTime() > oneWeekAgo),
      { id: trackId, date: new Date().toISOString() },
    ];
    localStorage.setItem('playedTracks', JSON.stringify(updatedTracks));
  };

  const loadNewTrack = async () => {
    setShowHint(false); // Ocultar la pista al cargar una nueva canción
    if (!accessToken) return;
  
    // Pausar todos los fragmentos de audio en reproducción
    Array.from({ length: fragments }).forEach((_, index) => {
      const audioFragment = document.getElementById(`audio-fragment-${index}`) as HTMLAudioElement;
      if (audioFragment) {
        audioFragment.pause();
        audioFragment.currentTime = 0;
      }
    });
  
    const audioFull = document.getElementById('audio-full') as HTMLAudioElement;
    if (audioFull) {
      audioFull.pause();
      audioFull.currentTime = 0;
    }
  
    // Cargar canciones ya reproducidas de localStorage
    const playedTracks = JSON.parse(localStorage.getItem('playedTracks') || '[]').map((item: any) => item.id);
  
    // Obtener las canciones de las más populares, excluyendo las reproducidas
    let trackData = await getTopTracks(accessToken, countryCode);
    trackData = trackData.filter((item: any) => !playedTracks.includes(item.track.id));
  
    // Si todas las canciones se han reproducido, restablece el historial
    if (trackData.length === 0) {
      localStorage.removeItem('playedTracks');
      trackData = await getTopTracks(accessToken, countryCode);
    }
  
    // Seleccionar una nueva canción de las disponibles
    if (trackData.length > 0) {
      const randomIndex = Math.floor(Math.random() * trackData.length);
      const newTrack = trackData[randomIndex];
      setTrack(newTrack);
  
      // Guardar esta canción como reproducida
      savePlayedTrack(newTrack.track.id);
  
      // Reiniciar el estado para la nueva canción
      setObfuscatedTitle(generateObfuscatedTitle(newTrack.track.name));
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
    const maxStart = Math.max(0, audio.duration - duration); // Máximo inicio para evitar desbordamiento
    audio.currentTime = Math.floor(Math.random() * maxStart);
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
        // Añadir un log para verificar el valor de accessToken y el valor de búsqueda
        console.log("Access Token:", accessToken);
        console.log("Search Query:", value);
  
        const response = await axios.get('https://api.spotify.com/v1/search', {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            q: value,
            type: 'track',
            limit: 3,
          },
        });
  
        // Verificar la respuesta de la API
        console.log("Search Response:", response.data);
  
        // Actualizar sugerencias solo si hay resultados
        if (response.data && response.data.tracks && response.data.tracks.items) {
          setSuggestions(response.data.tracks.items);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error en la búsqueda de canciones:', error);
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
    const isCorrect = track?.track?.name.toLowerCase() === guess.toLowerCase();
    setResult(isCorrect ? "¡Correcto!" : "Incorrecto, intenta otra vez.");
    setIsGuessedCorrectly(isCorrect);
  
    if (isCorrect) {
      setGuess(''); 
      const newCurrentStreak = currentStreak + 1;
      setCurrentStreak(newCurrentStreak);
      if (newCurrentStreak > maxStreak) setMaxStreak(newCurrentStreak);
      playFullTrackFor30Seconds();
      
      // Ocultar mensaje después de 2 segundos si es correcto
      setTimeout(() => {
        setResult('');
      }, 2000);
    } else {
      setCurrentStreak(0);
    }
  
    await updateUserStreak(userId, isCorrect);
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
    <>
      <Head>
        <title>Modo Clásico - Tracktive</title>
        <meta name="description" content="Prueba el modo clásico de Tracktive y adivina canciones en segundos." />
        <meta property="og:title" content="Modo Clásico - Tracktive" />
        <meta property="og:description" content="¿Cuántas canciones puedes adivinar en el modo clásico de Tracktive?" />
        <meta property="og:image" content="/static/classic-mode-game.jpg" />
      </Head>
    <div className="flex flex-col items-center min-h-screen bg-green-100 pt-16">
      {isGuessedCorrectly && <Confetti />}
      
      <div className="mb-10">
        <h2
          style={{
            fontSize: track?.track?.name?.length > 20 ? '1.5rem' : '2rem', // Reduce el tamaño si es largo
            whiteSpace: 'nowrap', // Evita que el texto se divida en varias líneas
            overflow: 'hidden', // Oculta el desbordamiento del texto
            textOverflow: 'ellipsis', // Añade puntos suspensivos si el texto es demasiado largo
            maxWidth: '100%', // Asegura que el texto no exceda el ancho disponible
          }}
          className={`font-bold mb-4 transition-all duration-700 ease-in-out ${
            isGuessedCorrectly ? 'filter-none' : 'filter blur-lg'
          }`}
        >
          {isGuessedCorrectly ? track.track.name : obfuscatedTitle}
        </h2>
      </div>


      {track && (
        <div className="mb-4">
          {Array.from({ length: fragments }).map((_, index) => (
            <div key={index} className="flex items-center mb-4">
              <audio id={`audio-fragment-${index}`} src={track.track.preview_url} preload="auto" />
              <button
                onClick={() => handlePlay(index)}
                className="bg-green-500 text-white px-4 py-2 rounded-full shadow-md"
              >
                {playingIndex === index ? `${timeLeft} s restantes` : `Fragmento ${index + 1}`}
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
          placeholder="Buscar canción..."
          className="border rounded-md px-4 py-2 w-full"
        />

        {/* Renderizar sugerencias justo debajo del input */}
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

        {/* Mover los botones "Adivinar" y "Hint" hacia abajo */}
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
              setShowHint(false); // Ocultar la pista
              setResult(''); // Ocultar el mensaje de resultado
              loadNewTrack();
            }}
            className="bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-yellow-600 transition"
          >
            Siguiente canción
          </button>
                
        ) : (
          <button
            onClick={() => {
              setShowHint(false); // Ocultar la pista
              setResult(''); // Ocultar el mensaje de resultado
              loadNewTrack();
              setGuess('');
              setIsGuessedCorrectly(false);
            }}
            className="bg-gray-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-600 transition"
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
    </>
  );
};

export default ClassicModeGame;
