"use client";

import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RoomPageProps {
  params: { roomCode: string };
}

const RoomPage: React.FC<RoomPageProps> = ({ params }) => {
  const { roomCode } = params;
  const router = useRouter();
  const { data: session } = useSession();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('common');

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomCode) {
        setError("Room code is missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode);

      if (error || !data || data.length === 0) {
        console.error("Error fetching room data:", error || "Room not found");
        setError("Room not found or an error occurred.");
      } else {
        setRoom(data[0]); // Asumimos que solo debería haber una sala con ese código
      }
      setLoading(false);
    };

    fetchRoomData();
  }, [roomCode]);

  if (loading) return <div>{t('loading')}...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Room: {room?.name}</h1>
      <p>Code: {room?.code}</p>
      {/* Aquí se puede añadir más información de la sala o funcionalidad */}
    </div>
  );
};

export default RoomPage;
