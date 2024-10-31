// src/app/components/JoinCreateRoomModal.tsx
"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import generateRoomCode from '../utils/generateRoomCode';

interface JoinCreateRoomModalProps {
  onClose: () => void;
}

const JoinCreateRoomModal: React.FC<JoinCreateRoomModalProps> = ({ onClose }) => {
    const { data: session } = useSession();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [roomCode, setRoomCode] = useState('');
    const [roomName, setRoomName] = useState('');
    const [generatedRoomCode, setGeneratedRoomCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useTranslation('common');

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError(t('pleaseEnterRoomName'));
      return;
    }

    // Generar room code y password
    const newRoomCode = generateRoomCode();

    // Insertar la sala en Supabase
    const { data, error } = await supabase.from('rooms').insert([
      {
        name: roomName,
        code: newRoomCode,
        host_email: '' // Opcional: puedes añadir host_email si es necesario
      }
    ]);

    if (error) {
      console.error('Error creating room:', error);
      setError(t('failedToCreateRoom'));
      return;
    }

    // Setear los valores generados para mostrarlos
    setRoomName(roomName);
    setGeneratedRoomCode(newRoomCode);
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError(t('pleaseEnterRoomCodeAndPassword'));
      return;
    }
  
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .single();
  
    if (error || !data) {
      console.error('Error joining room:', error);
      setError(t('roomNotFoundOrIncorrectPassword'));
      return;
    }
  
    // Añadir participante a la tabla 'participants'
    const { error: insertError } = await supabase.from('participants').insert([
      {
        room_code: roomCode,
        name: session?.user?.name || 'Anonymous' // Ajusta esto según cómo manejes los nombres de usuario
      }
    ]);
  
    if (insertError) {
      console.error('Error adding participant:', insertError);
      setError(t('failedToJoinRoom'));
      return;
    }
  
    // Redirigir al usuario a la sala de espera
    onClose();
    router.push(`/rooms/${roomCode}/waiting`);
  };
  

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log(t('copiedToClipboard'));
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingRoom) {
      await handleCreateRoom();
    } else {
      await handleJoinRoom();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isCreatingRoom ? t('createRoom') : t('joinRoom')}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!generatedRoomCode ? (
          <form onSubmit={handleSubmit}>
            {isCreatingRoom ? (
              <>
                <label className="block mb-2">{t('roomName')}</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="border rounded-md px-4 py-2 w-full mb-4"
                  placeholder={t('enterRoomName')}
                  required
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-full w-full mb-4 hover:bg-green-600 transition"
                >
                  {t('createRoom')}
                </button>
              </>
            ) : (
              <>
                <label className="block mb-2">{t('roomName')}</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="border rounded-md px-4 py-2 w-full mb-4"
                  placeholder={t('enterRoomCode')}
                  required
                />
                <label className="block mb-2">{t('roomPassword')}</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="border rounded-md px-4 py-2 w-full mb-4"
                  placeholder={t('enterRoomPassword')}
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-full w-full mb-4 hover:bg-blue-600 transition"
                >
                  {t('joinRoom')}
                </button>
              </>
            )}
          </form>
        ) : (
          <div className="mt-4">
            <p><strong>{t('roomName')}:</strong> {roomName} <button onClick={() => handleCopy(roomName)} className="ml-2 text-blue-500 underline">{t('copy')}</button></p>
            <p><strong>{t('roomCode')}:</strong> {generatedRoomCode} <button onClick={() => handleCopy(generatedRoomCode)} className="ml-2 text-blue-500 underline">{t('copy')}</button></p>
            <button
              onClick={() => router.push(`/rooms/${generatedRoomCode}/waiting`)}
              className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-full w-full hover:bg-purple-600 transition"
            >
              {t('goToWaitingRoom')}
            </button>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-full w-full hover:bg-red-600 transition"
        >
          {t('close')}
        </button>
        <button
          onClick={() => setIsCreatingRoom(!isCreatingRoom)}
          className="mt-2 text-blue-600 underline w-full text-center"
        >
          {isCreatingRoom ? t('joinRoomInstead') : t('createRoomInstead')}
        </button>
      </div>
    </div>
  );
};

export default JoinCreateRoomModal;
