import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import JoinCreateRoomModal from './JoinCreateRoomModal';

interface MutatedModeConfigProps {
  onStartGame: (selection: any[], fragments: number, duration: number) => void;
}

const MutatedModeConfig: React.FC<MutatedModeConfigProps> = ({ onStartGame }) => {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const accessToken = (session as any)?.token?.access_token;
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<any[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [filteredGenres, setFilteredGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [fragments, setFragments] = useState(3);
  const [duration, setDuration] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const isGenresDisabled = true;
  const [isMobile, setIsMobile] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);

  // Detectar si el dispositivo es móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRoomButtonClick = () => {
    setShowRoomModal(true);
  };

  // Calcular si se puede iniciar el juego
  const canStartGame = selectedPlaylists.length > 0 || selectedArtists.length > 0;

  useEffect(() => {
    if (accessToken) {
      const fetchGenres = async () => {
        try {
          const response = await axios.get('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setGenres(response.data.genres);
          setFilteredGenres(response.data.genres);
        } catch (error) {
          console.error(t('errorFetchingGenres'));
        }
      };

      const fetchPlaylists = async () => {
        try {
          const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setPlaylists(response.data.items);
          setFilteredPlaylists(response.data.items);
        } catch (error) {
          console.error(t('errorFetchingPlaylists'));
        }
      };

      fetchGenres();
      fetchPlaylists();
      setIsLoading(false);
    }
  }, [accessToken, t]);

  const searchArtists = async (query: string) => {
    if (query.length >= 3 && accessToken) {
      try {
        const response = await axios.get('https://api.spotify.com/v1/search', {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            q: query,
            type: 'artist',
            limit: 10,
          },
        });
        setSearchResults(response.data.artists.items);
      } catch (error) {
        console.error(t('errorSearchingArtists'));
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleFilterPlaylists = (filter: string) => {
    setFilteredPlaylists(playlists.filter((playlist) => playlist.name.toLowerCase().includes(filter.toLowerCase())));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-green-100">
        <p className="text-2xl font-semibold text-gray-600 animate-pulse">{t('loadingTracks')}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 p-8">
      <h2 className="text-3xl font-bold mb-8">{t('configureMutation')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Playlists */}
        <div>
          <h3 className="text-xl font-semibold mb-2">{t('selectPlaylists')}</h3>
          <input
            type="text"
            placeholder={t('searchPlaylists')}
            onChange={(e) => handleFilterPlaylists(e.target.value)}
            className="w-full p-2 mb-2 border rounded-lg"
          />
          <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto border-t pt-4">
            {filteredPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => setSelectedPlaylists((prev) =>
                  prev.includes(playlist.id)
                    ? prev.filter((id) => id !== playlist.id)
                    : [...prev, playlist.id]
                )}
                className={`p-4 border rounded-lg shadow-md cursor-pointer transition ${
                  selectedPlaylists.includes(playlist.id) ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
                }`}
              >
                <img
                  src={playlist.images?.length > 0 ? playlist.images[0].url : '/default-image.jpg'}
                  alt="playlist"
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
                <p className="text-center font-medium">{playlist.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Genres (Desactivado) */}
        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-400">{t('selectGenres')} (Desactivado)</h3>
          <input
            type="text"
            placeholder={t('searchGenres')}
            onChange={() => {}} // Sin función de filtro ya que está deshabilitado
            className="w-full p-2 mb-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
          <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto border-t pt-4 opacity-50">
            {filteredGenres.map((genre) => (
              <div
                key={genre}
                onClick={() => {}} // Deshabilitado sin acción de clic
                className={`p-4 border rounded-lg shadow-md cursor-not-allowed transition bg-gray-200 text-gray-500`}
              >
                <p className="text-center font-medium">{genre}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Artists Search */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-xl font-semibold mb-2">{t('searchSelectArtists')}</h3>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              searchArtists(e.target.value);
            }}
            placeholder={t('searchArtists')}
            className="w-full p-2 mb-4 border rounded-lg"
          />
          <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto border-t pt-4">
            {searchResults.map((artist) => (
              <div
                key={artist.id}
                onClick={() => setSelectedArtists((prev) =>
                  prev.includes(artist.id)
                    ? prev.filter((id) => id !== artist.id)
                    : [...prev, artist.id]
                )}
                className={`p-4 border rounded-lg shadow-md cursor-pointer transition ${
                  selectedArtists.includes(artist.id) ? 'bg-green-500 text-white' : 'bg-white text-gray-800'
                }`}
              >
                <img
                  src={artist.images?.length > 0 ? artist.images[0].url : '/default-image.jpg'}
                  alt="artist"
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
                <p className="text-center font-medium">{artist.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fragment and Duration Selectors */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 mt-8">
        <div>
          <label className="block text-lg font-semibold mb-2">{t('numFragments')}</label>
          <div className="flex space-x-4">
            {[1, 3, 5].map((option) => (
              <button
                key={option}
                onClick={() => setFragments(option)}
                className={`px-4 py-2 rounded-full shadow-lg transition ${
                  fragments === option ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {t(`fragmentOptions.${option === 1 ? 'oneFragment' : option === 3 ? 'threeFragments' : 'fiveFragments'}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold mb-2">{t('duration')}</label>
          <div className="flex space-x-4">
            {[2, 4, 5].map((option) => (
              <button
                key={option}
                onClick={() => setDuration(option)}
                className={`px-4 py-2 rounded-full shadow-lg transition ${
                  duration === option ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {t(`durationOptions.${option === 2 ? 'twoSeconds' : option === 4 ? 'fourSeconds' : 'fiveSeconds'}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          const newSelection = [
            ...selectedPlaylists.map((playlist) => ({ type: 'playlist', id: playlist })),
            ...selectedArtists.map((artist) => ({ type: 'artist', id: artist })),
          ];
          
          onStartGame(newSelection, fragments, duration);
        }}
        className={`px-6 py-3 mt-10 mb-8 font-semibold rounded-full shadow-lg transition ${
          canStartGame ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
        }`}
        disabled={!canStartGame}
      >
        {t('play')}
      </button>
      <button 
        onClick={handleRoomButtonClick}
        className={`px-4 py-2 mb-6 bg-blue-500 text-white font-semibold rounded-full shadow-lg hover:bg-blue-400 transition ${isMobile ? 'w-full' : ''}`}
      >
        {t('joinOrCreateRoom')}
      </button>

      <p className={`text-gray-400 italic ${isMobile ? 'text-center' : ''}`}>{t('howToPlayContent')}</p>

      {showRoomModal && (
        <JoinCreateRoomModal onClose={() => setShowRoomModal(false)} />
      )}
    </div>
  );
};

export default MutatedModeConfig;
