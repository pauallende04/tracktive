// src/app/components/ClassicModeGame.tsx
import React, { useEffect, useState } from 'react';
import { getSpotifyToken, getTopTracks } from '../utils/spotify';

const ClassicModeGame = ({ fragments, duration, countryCode }: { fragments: number; duration: number; countryCode: string }) => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [playingIndex, setPlayingIndex] = useState<null | number>(null);
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const fetchTracks = async () => {
      const token = await getSpotifyToken();
      const tracks = await getTopTracks(token, countryCode);
      setTracks(tracks);
    };
    fetchTracks();
  }, [countryCode]);

  const handlePlay = (index: number) => {
    if (playingIndex !== null && playingIndex !== index) {
      const audio = document.getElementById(`audio-${playingIndex}`) as HTMLAudioElement;
      audio.pause();
      audio.currentTime = 0;
    }
    setPlayingIndex(index);
    setTimeLeft(duration);

    const currentAudio = document.getElementById(`audio-${index}`) as HTMLAudioElement;
    currentAudio.play();
  };

  const handlePause = (index: number) => {
    const audio = document.getElementById(`audio-${index}`) as HTMLAudioElement;
    audio.pause();
    setPlayingIndex(null);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (playingIndex !== null) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 1) {
            const audio = document.getElementById(`audio-${playingIndex}`) as HTMLAudioElement;
            audio.pause();
            return duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playingIndex, duration]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-green-100 pt-6">
      <h2 className="text-3xl font-bold mb-4">*** Canción Misteriosa ***</h2>

      <div className="mb-4">
        {tracks.slice(0, fragments).map((track, index) => (
          <div key={track.track.id} className="flex items-center space-x-4 mb-4">
            <audio id={`audio-${index}`} src={track.track.preview_url} preload="auto" />
            <button
              onClick={() => (playingIndex === index ? handlePause(index) : handlePlay(index))}
              className="bg-green-500 text-white px-4 py-2 rounded-full shadow-md"
            >
              {playingIndex === index ? "Pausar" : `Reproducir Fragmento ${index + 1}`}
            </button>
            {playingIndex === index && <span className="text-gray-700">{timeLeft} s restantes</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassicModeGame;
