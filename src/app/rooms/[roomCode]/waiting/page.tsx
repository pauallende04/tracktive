// src/app/rooms/[roomCode]/waiting/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

interface Participant {
  id: number;
  name: string;
  is_master: boolean;
}

const WaitingRoom: React.FC = () => {
  const { t } = useTranslation('common');
  const { roomCode } = useParams<{ roomCode: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [maxParticipants] = useState(8);
  const [room, setRoom] = useState<any>(null);
  const [isMaster, setIsMaster] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificación y carga de la sala
  useEffect(() => {
    const fetchRoomData = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (error || !data) {
        setError(t('roomNotFound'));
        router.push('/');
        return;
      }

      setRoom(data);
      setIsMaster(data.host_email === session?.user?.email); // Solo el creador es el master
    };

    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('room_code', roomCode);

      if (error) {
        console.error(t('failedToFetchParticipants'), error);
        return;
      }

      setParticipants(data as Participant[]);
    };

    const joinRoom = async () => {
      if (!session || !session.user) {
        setError(t('loginRequired'));
        return;
      }

      const existingParticipant = participants.find((p) => p.name === session.user?.name);
      
      if (!existingParticipant) {
        const { error: insertError } = await supabase
          .from('participants')
          .insert([
            {
              name: session.user.name,
              room_code: roomCode,
              is_master: room?.host_email === session.user.email, // Solo el creador se establece como master
            },
          ]);

        if (insertError) {
          setError(t('failedToJoinRoom'));
          console.error(insertError);
        } else {
          setIsMaster(room?.host_email === session.user.email); // Asigna `isMaster` en el frontend si el usuario es el creador
        }
      }
    };

    fetchRoomData();
    fetchParticipants();
    joinRoom();

    const subscription = supabase
      .channel(`participants:${roomCode}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'participants' }, (payload) => {
        if (payload.new.room_code === roomCode) {
          setParticipants((prev) => [...prev, payload.new as Participant]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [roomCode, router, session, participants, t]);

  // Manejador para iniciar partida (disponible solo para el master)
  const handleStartGame = () => {
    if (isMaster) {
      router.push(`/rooms/${roomCode}/game`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-200 to-blue-200 p-8">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">{t('roomName')}: {room?.name}</h1>
        <p className="mb-2 font-semibold">
          {t('roomCode')}: <span className="text-blue-600">{roomCode}</span>
        </p>
        <p className="mb-6 text-gray-600">
          {t('participants')}: {participants.length}/{maxParticipants}
        </p>

        <ul className="mb-6 border-t border-gray-200 pt-4 space-y-2">
          {participants.map((participant) => (
            <li key={participant.id} className="text-gray-800">
              {participant.name} {participant.is_master && <span className="text-sm font-semibold text-purple-500">(Master)</span>}
            </li>
          ))}
        </ul>

        {isMaster ? (
          <button
            onClick={handleStartGame}
            className="bg-purple-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-purple-600 transition w-full"
          >
            {t('startGame')}
          </button>
        ) : (
          <p className="text-gray-500 italic">{t('waitingForMaster')}</p>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;
