export type User = { id: string };

/**
 * Eventos de auth que o app trata. supabase-js emite mais eventos
 * (TOKEN_REFRESHED, PASSWORD_RECOVERY, ...); este tipo é o subconjunto
 * que realmente altera a sessão do usuário na interface.
 */
export type Profile = {
  user_id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  created_at: string;
  updated_at: string;
};

export type AuthStateChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED';

export function isAuthStateChangeEvent(event: string): event is AuthStateChangeEvent {
  return event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED';
}
