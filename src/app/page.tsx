'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useUserCountry } from './hooks/useUserCountry';
import { getFlagEmoji } from './utils/flags';

const HomePage: React.FC = () => {
  const { data: session, status } = useSession();
  const country = useUserCountry();

  if (status === 'loading') {
    return (
      <div className="loading-screen flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="flex">
          <span className="text-5xl font-bold text-white animate-pulse">Tracktive</span>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div>
        <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
          <div className="flex items-center">
            {/* Muestra la imagen de perfil del usuario */}
            <img 
              src={session.user?.image || '/default-profile.png'} 
              alt="User profile" 
              className="w-10 h-10 rounded-full mr-3  " 
            />
            <span className="mr-2">{session.user?.name}</span>
            {country && <span >{getFlagEmoji(country)}</span>}
          </div>
          <button onClick={() => signOut()} className="bg-red-500 px-4 py-2 rounded">
            Sign Out
          </button>
        </nav>
        {/* Aquí puedes añadir más contenido para la página principal */}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">¡Bienvenido a Tracktive!</h1>
        <p className="text-lg mb-8">
          El desafío de la música te espera. ¿Estás listo para demostrar tus conocimientos musicales?
        </p>
        <button
          onClick={() => signIn('spotify')}
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-400 transition"
        >
          Conéctate con Spotify
        </button>
      </div>
    </div>
  );
};

export default HomePage;
