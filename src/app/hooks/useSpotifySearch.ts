import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useState } from 'react';

const useSpotifySearch = () => {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchSpotify = async (query: string, type: 'artist' | 'genre') => {
    if (!accessToken || !query) return;

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          q: query,
          type: type,
          limit: 10,
        },
      });
      setSearchResults(response.data.artists?.items || response.data.genres?.items);
    } catch (error) {
      console.error('Error searching Spotify:', error);
    }
  };

  return { searchResults, searchSpotify };
};

export default useSpotifySearch;
