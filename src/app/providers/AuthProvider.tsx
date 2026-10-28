import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getSession,
  onAuthStateChange,
  signIn,
  signOut,
  signUp,
} from '../../entities/user/api/auth';
import type { User } from '../../entities/user/model/user';

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth deve ser usado dentro de um <AuthProvider>.');
  }
  return ctx;
}

/**
 * Mantém a sessão do Supabase sincronizada com o estado global da interface.
 * - Restaura a sessão existente uma única vez ao montar (getSession).
 * - Reage a login/logout explícito via onAuthStateChange, ignorando
 *   TOKEN_REFRESHED para não disparar redirecionamentos durante a navegação.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const { user: sessionUser } = await getSession();
        if (!mounted) return;
        setUser(sessionUser);
      } catch {
        // Falha ao restaurar a sessão (rede indisponível ou credenciais
        // inválidas): não deixa o app travado em loading para sempre.
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    restoreSession();

    const authChannel = onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const event = _event as 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED';
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setUser(session?.user ? { id: session.user.id } : null);
      }
      // Não altera loading após a inicialização: evita redirect durante navegação.
    });

    return () => {
      mounted = false;
      authChannel?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignIn = useCallback(
    (email: string, password: string) => signIn(email, password),
    []
  );
  const handleSignUp = useCallback(
    (email: string, password: string) => signUp(email, password),
    []
  );
  const handleSignOut = useCallback(() => signOut(), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
