import { supabase } from '../../../shared/lib/supabase/client';
import type { User, AuthStateChangeEvent } from '../model/user';

export async function signIn(email: string, password: string): Promise<void> {
  // @ts-expect-error - signInWithPassword existe em tempo de execução; os tipos do supabase-js instalados não expõem essa assinatura.
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string): Promise<void> {
  // @ts-expect-error - signUp existe em tempo de execução; os tipos do supabase-js instalados não expõem essa assinatura.
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  // @ts-expect-error - signOut existe em tempo de execução; os tipos do supabase-js instalados não expõem essa assinatura.
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<{ user: User | null }> {
  // @ts-expect-error - getSession existe em tempo de execução; tipos do supabase-js instalados não expõem essa assinatura.
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const user = data?.session?.user;
  return { user: user ? { id: user.id } : null };
}

export async function getCurrentUser(): Promise<{ id: string } | null> {
  // @ts-expect-error - getUser existe em tempo de execução; tipos do supabase-js instalados não expõem essa assinatura.
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user ? { id: data.user.id } : null;
}

export type AuthStateChangeListener = (
  event: AuthStateChangeEvent,
  session: { user: User | null } | null
) => void;

export function onAuthStateChange(listener: AuthStateChangeListener) {
  // @ts-expect-error - onAuthStateChange existe em tempo de execução; tipos do supabase-js instalados não expõem essa assinatura.
  const { data } = supabase.auth.onAuthStateChange(
    (event: AuthStateChangeEvent, session: { user: User | null } | null) => {
      listener(event, session);
    }
  );
  return data;
}
