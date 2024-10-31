// src/app/rooms/[roomCode]/game/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const GamePage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { data: session } = useSession();
  const [room, setRoom] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRoomData = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (error || !data) {
        console.error('Error fetching room data:', error);
        router.push('/'); // Redirigir si la sala no existe
        return;
      }

      setRoom(data);
    };

    fetchRoomData();
  }, [roomCode, router]);

  if (!room) {
    return <div>Cargando partida...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Partida en Curso: {room.name}</h1>
      <p className="mb-4">Código de Sala: {roomCode}</p>
      {/* Aquí puedes implementar la lógica del juego */}
      <p className="text-gray-400 italic">Implementa la lógica del juego aquí.</p>
    </div>
  );
};

export default GamePage;
