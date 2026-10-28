import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Spinner } from '../../components/ui';

/**
 * Guarda de rota: renderiza os filhos apenas quando a sessão já foi
 * resolvida e há usuário autenticado. Enquanto carrega, mostra um spinner
 * centralizado (evita piscar conteúdo protegido). Sem usuário, redireciona
 * para /login guardando a rota de destino em `state.from`.
 *
 * Os rotas filhas são renderizadas via <Outlet /> (react-router não passa
 * elementos filhas como props.children do componente da rota).
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Spinner size="lg" ariaLabel="Verificando sessão…" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
