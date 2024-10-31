// src/components/JoinRoomModal.tsx
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';

interface JoinRoomModalProps {
  onClose: () => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ onClose }) => {
  const { t } = useTranslation('common');
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session } = useSession();
  const [participants, setParticipants] = useState<Participant[]>([]); // Aseguramos un array vacío por defecto


  interface Participant {
    id: number;
    name: string;
  }


  const handleJoinRoom = async () => {
    const { data: roomData, error: fetchError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .eq('name', roomName)
      .single();

    if (fetchError || !roomData) {
      setError(t('roomNotFoundOrIncorrectPassword'));
      return;
    }

    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .eq('room_code', roomCode);

      if ((participants?.length || 0) >= 8) {
        setError(t('roomFull'));
        return;
      }

    await supabase.from('participants').insert([
      { name: session?.user?.name, room_code: roomCode },
    ]);

    router.push(`/rooms/${roomCode}/waiting`);
  };

  return (
    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">{t('joinRoom')}</h2>
        
        <input
          type="text"
          placeholder={t('roomName')}
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 mb-3 w-full"
        />
        <input
          type="text"
          placeholder={t('roomCode')}
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          className="border border-gray-300 rounded px-3 py-2 mb-3 w-full"
        />

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleJoinRoom}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 mb-3"
        >
          {t('joinRoom')}
        </button>

        <button
          onClick={onClose}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded w-full hover:bg-gray-400"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};

export default JoinRoomModal;
