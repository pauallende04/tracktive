import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export const useUserCountry = () => {
  const { data: session } = useSession();
  const [country, setCountry] = useState<string | null>(null);

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
        } catch (error) {
          console.error('Error fetching user country:', error);
        }
      }
    };

    fetchUserCountry();
  }, [session]);

  return country;
};
