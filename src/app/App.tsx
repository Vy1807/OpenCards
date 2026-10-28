import { BrowserRouter, useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from '../shared/ui';
import { LogoutIcon } from '../shared/ui/icons';
import { AuthProvider, CardsProvider, useAuth } from './providers';
import { routes } from './routes';

/**
 * Botão de saída. Renderizado apenas com sessão ativa; encerra a sessão no
 * Supabase e redireciona para o login. O AuthProvider escuta o evento
 * SIGNED_OUT e limpa o usuário do estado global.
 */
function Sessao() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <button
      className="btn btn-danger"
      onClick={handleSignOut}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginLeft: 'auto',
        padding: '0.5rem 1rem',
      }}
    >
      <LogoutIcon size={18} style={{ verticalAlign: 'middle' }} /> Sair
    </button>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CardsProvider>
          <div className="app" style={{ display: 'flex', flexDirection: 'column' }}>
            <ThemeSwitcher />
            <Sessao />
            {routes()}
          </div>
        </CardsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
