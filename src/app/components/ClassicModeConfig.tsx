// src/app/components/ClassicModeConfig.tsx
import React, { useState } from 'react';

const ClassicModeConfig = ({ onStartGame }: { onStartGame: (fragments: number, duration: number) => void }) => {
  const [fragments, setFragments] = useState(3); // Predeterminado a 3 fragmentos
  const [duration, setDuration] = useState(5);   // Predeterminado a 5 segundos

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h2 className="text-2xl font-bold mb-4">Configura tu partida</h2>
      
      <div className="mb-6">
        <label className="block mb-2">Número de fragmentos:</label>
        <select 
          value={fragments}
          onChange={(e) => setFragments(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value={1}>1 fragmento</option>
          <option value={3}>3 fragmentos</option>
          <option value={5}>5 fragmentos</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-2">Duración de cada fragmento (segundos):</label>
        <select 
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value={2}>2 segundos</option>
          <option value={4}>4 segundos</option>
          <option value={5}>5 segundos</option>
        </select>
      </div>

      <button 
        onClick={() => onStartGame(fragments, duration)}
        className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-400 transition mb-6"
      >
        Play
      </button>

      <p className="text-gray-400 italic">Invita a un amigo y demuestra tus habilidades...</p>
    </div>
  );
};

export default ClassicModeConfig;
