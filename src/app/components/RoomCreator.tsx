// src/app/rooms/RoomCreator.tsx
"use client";

import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const RoomCreator: React.FC = () => {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!session || !session.user) {
      setError(t('loginRequired'));
      return;
    }

    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert([{ name: roomName, code: roomCode, host_email: session.user.email }])
      .select();

    if (roomError || !roomData) {
      setError(t('failedToCreateRoom'));
      return;
    }

    const { error: participantError } = await supabase
      .from('participants')
      .insert([{ 
        name: session.user.name,
        room_code: roomData[0].code,
        is_master: true // El creador es el "master"
      }]);

    if (participantError) {
      setError(t('failedToJoinRoom'));
      return;
    }

    router.push(`/rooms/${roomCode}/waiting`);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">{t('createRoom')}</h2>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder={t('enterRoomName')}
        className="mb-4 p-2 border rounded w-full"
      />
      <button
        onClick={handleCreateRoom}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        {t('createRoom')}
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default RoomCreator;
