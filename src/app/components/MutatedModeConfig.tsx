import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface MutatedModeConfigProps {
  onStartGame: (selection: any[], fragments: number, duration: number) => void;
}

const MutatedModeConfig: React.FC<MutatedModeConfigProps> = ({ onStartGame }) => {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const accessToken = (session as any)?.token?.access_token;
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [fragments, setFragments] = useState(3);
  const [duration, setDuration] = useState(5);

  useEffect(() => {
    if (accessToken) {
      const fetchGenres = async () => {
        try {
          const response = await axios.get('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setGenres(response.data.genres);
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
        } catch (error) {
          console.error(t('errorFetchingPlaylists'));
        }
      };

      fetchGenres();
      fetchPlaylists();
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h2 className="text-2xl font-bold mb-4">{t('configureMutation')}</h2>

      <div className="mb-6">
        <label className="block mb-2">{t('selectPlaylists')}</label>
        <div className="grid grid-cols-2 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="flex items-center">
              <input
                type="checkbox"
                value={playlist.id}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPlaylists([...selectedPlaylists, playlist.id]);
                  } else {
                    setSelectedPlaylists(selectedPlaylists.filter((id) => id !== playlist.id));
                  }
                }}
              />
              <img
                src={playlist.images?.length > 0 ? playlist.images[0].url : '/default-image.jpg'}
                alt="playlist"
                className="w-10 h-10 ml-2 rounded-full"
              />
              <label className="ml-2">{playlist.name}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block mb-2">{t('selectGenres')}</label>
        <div className="grid grid-cols-2 gap-4">
          {genres.map((genre) => (
            <div key={genre} className="flex items-center">
              <input
                type="checkbox"
                value={genre}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedGenres([...selectedGenres, genre]);
                  } else {
                    setSelectedGenres(selectedGenres.filter((id) => id !== genre));
                  }
                }}
              />
              <label className="ml-2">{genre}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block mb-2">{t('searchSelectArtists')}</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            searchArtists(e.target.value);
          }}
          placeholder={t('searchArtists')}
          className="border p-2 rounded"
        />
        <div className="grid grid-cols-2 gap-4 mt-2">
          {searchResults.map((artist) => (
            <div key={artist.id} className="flex items-center">
              <input
                type="checkbox"
                value={artist.id}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedArtists([...selectedArtists, artist.id]);
                  } else {
                    setSelectedArtists(selectedArtists.filter((id) => id !== artist.id));
                  }
                }}
              />
              <img
                src={artist.images?.length > 0 ? artist.images[0].url : '/default-image.jpg'}
                alt="artist"
                className="w-10 h-10 ml-2 rounded-full"
              />
              <label className="ml-2">{artist.name}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block mb-2">{t('numFragments')}</label>
        <select 
          value={fragments}
          onChange={(e) => setFragments(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value={1}>{t('fragmentOptions.oneFragment')}</option>
          <option value={3}>{t('fragmentOptions.threeFragments')}</option>
          <option value={5}>{t('fragmentOptions.fiveFragments')}</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-2">{t('duration')}</label>
        <select 
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value={2}>{t('durationOptions.twoSeconds')}</option>
          <option value={4}>{t('durationOptions.fourSeconds')}</option>
          <option value={5}>{t('durationOptions.fiveSeconds')}</option>
        </select>
      </div>

      <button 
        onClick={() => {
          const newSelection = [
            ...selectedPlaylists.map((playlist) => ({ type: 'playlist', id: playlist })),
            ...selectedGenres.map((genre) => ({ type: 'genre', id: genre })),
            ...selectedArtists.map((artist) => ({ type: 'artist', id: artist })),
          ];
          
          onStartGame(newSelection, fragments, duration);
        }}
        className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-400 transition mb-6"
      >
        {t('play')}
      </button>

      <p className="text-gray-400 italic">{t('howToPlayContent')}</p>
    </div>
  );
};

export default MutatedModeConfig;
