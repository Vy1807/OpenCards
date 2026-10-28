import { supabase } from '../../../shared/lib/supabase/client';
import type { Profile } from '../model/user';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data as unknown as Profile;
}

export async function upsertProfile(input: {
  userId: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
}): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: input.userId,
        nome: input.nome,
        cpf: input.cpf,
        telefone: input.telefone,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Profile;
}
