import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useState, useEffect } from 'react';

const useSpotifyPlaylists = () => {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const accessToken = session?.accessToken;

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!accessToken) return;

      try {
        const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setPlaylists(response.data.items);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    fetchPlaylists();
  }, [accessToken]);

  return playlists;
};

export default useSpotifyPlaylists;
