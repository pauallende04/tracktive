import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ArtistModeConfig = ({ onStartGame }: { onStartGame: (fragments: number, duration: number) => void }) => {
  const [fragments, setFragments] = useState(3);
  const [duration, setDuration] = useState(5);
  const { t } = useTranslation('common');
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si el dispositivo es móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-green-100 ${isMobile ? 'px-4' : ''}`}>
      <h2 className="text-2xl font-bold mb-4">{t('configureArtists')}</h2>
      
      <div className={`mb-6 ${isMobile ? 'w-full' : ''}`}>
        <label className="block mb-2">{t('numFragments')}</label>
        <select 
          value={fragments}
          onChange={(e) => setFragments(Number(e.target.value))}
          className={`border p-2 rounded ${isMobile ? 'w-full' : ''}`}
        >
          <option value={1}>{t('fragmentOptions.oneFragment')}</option>
          <option value={3}>{t('fragmentOptions.threeFragments')}</option>
          <option value={5}>{t('fragmentOptions.fiveFragments')}</option>
        </select>
      </div>

      <div className={`mb-6 ${isMobile ? 'w-full' : ''}`}>
        <label className="block mb-2">{t('duration')}</label>
        <select 
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className={`border p-2 rounded ${isMobile ? 'w-full' : ''}`}
        >
          <option value={2}>{t('durationOptions.twoSeconds')}</option>
          <option value={4}>{t('durationOptions.fourSeconds')}</option>
          <option value={5}>{t('durationOptions.fiveSeconds')}</option>
        </select>
      </div>

      <button 
        onClick={() => onStartGame(fragments, duration)}
        className={`px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-400 transition mb-6 ${isMobile ? 'w-full' : ''}`}
      >
        {t('play')}
      </button>

      <p className={`text-gray-400 italic ${isMobile ? 'text-center' : ''}`}>{t('guessArtist')}</p>
    </div>
  );
};

export default ArtistModeConfig;
