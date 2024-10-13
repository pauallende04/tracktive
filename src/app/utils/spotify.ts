// src/utils/spotify.ts

import axios from 'axios';

export const getTopTracks = async (token: string, countryCode: string = 'ES') => {
  try {
    // URL de la playlist del top de España (37i9dQZEVXbNFJfN1Vw8d9)
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/37i9dQZEVXbNFJfN1Vw8d9/tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const tracks = response.data.items;

    // Filtramos solo los primeros 10 o 20 resultados si deseas limitar
    return tracks.slice(0, 50);
  } catch (error) {
    console.error('Error al obtener el top de España:', error);
    return [];
  }
};
