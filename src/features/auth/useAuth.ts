import {
  useAuth as useAuthFromProvider,
  type AuthContextValue,
} from '../../app/providers/AuthProvider';

export type { AuthContextValue };

/**
 * Hook de autenticação. Expõe o usuário da sessão, estado de carregamento e
 * as ações signIn/signUp/signOut. Todo acesso ao Supabase fica no provider;
 * os componentes só consomem estado e ações tipadas.
 */
export function useAuth(): AuthContextValue {
  return useAuthFromProvider();
}
