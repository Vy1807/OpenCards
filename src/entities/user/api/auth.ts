import { supabase } from '../../../shared/lib/supabase/client';
import { isAuthStateChangeEvent, type User, type AuthStateChangeEvent } from '../model/user';

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<{ user: User | null }> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const user = data?.session?.user;
  return { user: user ? { id: user.id } : null };
}

export async function getCurrentUser(): Promise<{ id: string } | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user ? { id: data.user.id } : null;
}

export type AuthStateChangeListener = (
  event: AuthStateChangeEvent,
  session: { user: User | null } | null
) => void;

export function onAuthStateChange(listener: AuthStateChangeListener) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    const ev = event as AuthStateChangeEvent;
    if (isAuthStateChangeEvent(ev)) {
      listener(ev, session ? { user: session.user } : null);
    }
  });
  return data;
}
