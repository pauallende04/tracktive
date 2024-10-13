// src/utils/streaks.ts

import { supabase } from './supabaseClient'; // Configura tu cliente de Supabase aquí

export const getUserStreak = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('currentStreak, maxStreak, totalGuesses, correctGuesses')
    .eq('userId', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Si no existe un registro para este usuario, creamos uno inicial
      const { error: insertError } = await supabase
        .from('user_stats')
        .insert([{ userId, currentStreak: 0, maxStreak: 0, totalGuesses: 0, correctGuesses: 0 }]);

      if (insertError) {
        console.error('Error al crear el registro inicial del usuario:', insertError);
        return { currentStreak: 0, maxStreak: 0, totalGuesses: 0, correctGuesses: 0 };
      }

      // Retornamos valores iniciales después de crear el registro
      return { currentStreak: 0, maxStreak: 0, totalGuesses: 0, correctGuesses: 0 };
    } else {
      console.error('Error al obtener la racha del usuario:', error);
      return { currentStreak: 0, maxStreak: 0, totalGuesses: 0, correctGuesses: 0 };
    }
  }

  return {
    currentStreak: data.currentStreak || 0,
    maxStreak: data.maxStreak || 0,
    totalGuesses: data.totalGuesses || 0,
    correctGuesses: data.correctGuesses || 0,
  };
};

export const updateUserStreak = async (userId: string, isCorrect: boolean) => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('currentStreak, maxStreak, totalGuesses, correctGuesses')
    .eq('userId', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Creamos un nuevo registro si no existe
      const initialData = {
        userId,
        currentStreak: isCorrect ? 1 : 0,
        maxStreak: isCorrect ? 1 : 0,
        totalGuesses: 1,
        correctGuesses: isCorrect ? 1 : 0,
      };

      const { error: insertError } = await supabase.from('user_stats').insert([initialData]);
      if (insertError) {
        console.error('Error al crear el registro inicial del usuario:', insertError);
      }
      return;
    } else {
      console.error('Error al obtener la racha del usuario:', error);
      return;
    }
  }

  // Actualizamos los valores de racha y conteos
  const newCurrentStreak = isCorrect ? data.currentStreak + 1 : 0;
  const newMaxStreak = Math.max(data.maxStreak, newCurrentStreak);
  const newTotalGuesses = data.totalGuesses + 1;
  const newCorrectGuesses = isCorrect ? data.correctGuesses + 1 : data.correctGuesses;

  const { error: updateError } = await supabase
    .from('user_stats')
    .update({
      currentStreak: newCurrentStreak,
      maxStreak: newMaxStreak,
      totalGuesses: newTotalGuesses,
      correctGuesses: newCorrectGuesses,
    })
    .eq('userId', userId);

  if (updateError) {
    console.error('Error al actualizar la racha del usuario:', updateError);
  }
};
