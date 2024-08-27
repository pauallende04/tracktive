'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import React from 'react';
import Link from 'next/link';

const HomePage: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-center text-white">Cargando...</div>;
  }

  if (session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className='p-6 text-center text-white'>
          <p className='text-xl font-normal mb-2'>Signed in as</p>
          <span className='bold-txt text-2xl'>{session?.user?.name}</span>
          <p className='opacity-70 mt-8 mb-5 underline cursor-pointer' onClick={() => signOut()}>Sign Out</p>
        </div>
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

        <div className="space-y-6">
          <button className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-full shadow-lg hover:bg-yellow-400 transition">
            Empieza a Jugar
          </button>

          <button
            onClick={() => signIn('spotify')}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-400 transition"
          >
            Conéctate con Spotify
          </button>

          <p className="text-sm mt-4">
            Sube de nivel mientras juegas y desbloquea logros exclusivos. <br />
            ¿Quién liderará el ranking de los más conocedores?
          </p>
        </div>
      </div>

      <footer className="absolute bottom-4 text-white text-sm">
        <Link href="/about" className="hover:underline">Sobre Tracktive</Link> | 
        <Link href="/contact" className="hover:underline"> Contáctanos</Link>
      </footer>
    </div>
  );
};

export default HomePage;
