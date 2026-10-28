// @ts-expect-error - react-router-dom v7 tipos não exportam esses membros no .d.ts, mas funcionam em tempo de execução.
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './useAuth';

/**
 * Guarda de rota: renderiza os filhos apenas quando a sessão já foi
 * resolvida e há usuário autenticado. Enquanto carrega, não renderiza nada
 * (evita piscar conteúdo protegido). Sem usuário, redireciona para /login
 * guardando a rota de destino em `state.from`.
 */
export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
