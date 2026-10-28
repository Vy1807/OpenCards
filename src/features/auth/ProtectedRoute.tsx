// @ts-expect-error - react-router-dom v7 tipos não exportam esses membros no .d.ts, mas funcionam em tempo de execução.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Guarda de rota: renderiza os filhos apenas quando a sessão já foi
 * resolvida e há usuário autenticado. Enquanto carrega, não renderiza nada
 * (evita piscar conteúdo protegido). Sem usuário, redireciona para /login
 * guardando a rota de destino em `state.from`.
 *
 * Os rotas filhas são renderizadas via <Outlet /> (react-router não passa
 * elementos filhas como props.children do componente da rota).
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
