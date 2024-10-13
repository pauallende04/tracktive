// src/utils/addUserIfNotExists.ts
import {supabase} from './supabaseClient';

export const addUserIfNotExists = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('userId')
    .eq('userId', userId)
    .single();

  if (!data) {
    // Si el usuario no existe, lo agregamos
    const { error: insertError } = await supabase
      .from('user_stats')
      .insert({
        userId,
        currentStreak: 0,
        maxStreak: 0,
        totalGuesses: 0,
        correctGuesses: 0,
      });

    if (insertError) console.error('Error al crear usuario en user_stats:', insertError);
  } else if (error) {
    console.error('Error al verificar existencia de usuario:', error);
  }
};
