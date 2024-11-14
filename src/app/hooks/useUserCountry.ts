import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export const useUserCountry = () => {
  const { data: session } = useSession();
  const [country, setCountry] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    const fetchUserCountry = async () => {
      if (session && (session as any)?.token?.access_token) {
        try {
          const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
              Authorization: `Bearer ${(session as any).token.access_token}`,
            },
          });
          console.log('User Profile Data:', response.data);
          setCountry(response.data.country);
        } catch (error: any) {
          if (error.response?.status === 401) {
            setIsUnauthorized(true); // Indicamos que el error es 401
          } else {
            console.error('Error fetching user country:', error);
          }
        }
      }
    };

    fetchUserCountry();
  }, [session]);

  return { country, isUnauthorized };
};
