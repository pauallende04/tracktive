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
    <div className="flex flex-col items-center min-h-screen bg-green-100 pt-16">
      {isGuessedCorrectly && <Confetti />}
      {/* Render y lógica del juego */}
    </div>
  );
};

export default ArtistModeGame;
