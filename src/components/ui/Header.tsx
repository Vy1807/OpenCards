import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers';
import { ArrowLeftIcon, LogoutIcon, PaletteIcon, LogoIcon } from '../../shared/ui/icons';

/**
 * Wrapper seguro ao useAuth: retorna { user: null, signOut: noop } quando
 * não há <AuthProvider> no contexto (ex.: testes isolados de componentes).
 */
function useAuthSafe() {
  try {
    return useAuth();
  } catch {
    return { user: null, signOut: async () => {} };
  }
}

/**
 * Wrapper seguro ao useNavigate: retorna noop quando não há <Router> no contexto.
 */
function useNavigateSafe() {
  try {
    return useNavigate();
  } catch {
    return () => {};
  }
}

/**
 * Wrapper seguro ao useLocation: retorna pathname '/' quando não há <Router> no contexto.
 */
function useLocationSafe() {
  try {
    return useLocation();
  } catch {
    return { pathname: '/' };
  }
}

/**
 * Cabeçalho único usado em todas as telas do app (PARTE 1, seção 8).
 *
 * Desktop: cabeçalho branco (Superfície), 64px, borda inferior fina,
 * conteúdo limitado a 1200px. Logo + abas Baralhos/Revisar/Tarefas +
 * botão de tema (quadrado 40x40, ícone paleta) + avatar circular 40px.
 *
 * Celular e tablet: barra de cima (voltar + título + avatar).
 */
type HeaderProps = {
  /** Título da tela atual (exibido ao lado da marca/volta). */
  title?: string;
  /** Se true, exibe botão "Voltar" navegando para `backTo`. */
  showBack?: boolean;
  /** Rota para a qual o botão "Voltar" navega. Default: '/'. */
  backTo?: string;
};

export default function Header({ title, showBack = false, backTo = '/' }: HeaderProps) {
  const { user, signOut } = useAuthSafe();
  const navigate = useNavigateSafe();
  const location = useLocationSafe();

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/login');
  }, [signOut, navigate]);

  const initial = user?.id.charAt(0).toUpperCase() || '?';

  return (
    <header className="header">
      <div className="header__brand">
        <LogoIcon />
        <span className="header__brand-name">OpenCards</span>
      </div>

      {showBack && (
        <button
          type="button"
          className="btn"
          onClick={() => navigate(backTo)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeftIcon size={18} style={{ verticalAlign: 'middle' }} />
          <span>Voltar</span>
        </button>
      )}

      {title && (
        <span className="header__title">{title}</span>
      )}

      {/* Navegação desktop — aparece apenas em telas ≥1024px */}
      <nav className="header__nav" aria-label="Navegação principal">
        <button
          type="button"
          className="header__nav-link"
          onClick={() => navigate('/')}
          aria-current={location?.pathname === '/' ? 'page' : undefined}
        >
          Baralhos
        </button>
        <button
          type="button"
          className="header__nav-link"
          onClick={() => navigate('/decks/:id/review')}
          aria-current={location?.pathname?.startsWith('/decks') ? 'page' : undefined}
        >
          Revisar
        </button>
        <button
          type="button"
          className="header__nav-link"
          onClick={() => navigate('/kanban')}
          aria-current={location?.pathname === '/kanban' ? 'page' : undefined}
        >
          Tarefas
        </button>
      </nav>

      <div className="header__actions">
        <button
          type="button"
          className="btn theme-button"
          aria-label="Tema"
          title="Tema"
          onClick={() => {}}
        >
          <PaletteIcon size={20} style={{ verticalAlign: 'middle' }} />
        </button>
        <div className="user-menu">
          <button
            type="button"
            className="btn user-menu__trigger"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              width: '40px',
              height: '40px',
              minHeight: 'auto',
              minWidth: 'auto',
              borderRadius: '50%',
            }}
          >
            <span className="user-menu__avatar">{initial}</span>
          </button>
          <div className="user-menu__dropdown">
            <button
              type="button"
              className="user-menu__item"
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <LogoutIcon size={16} style={{ verticalAlign: 'middle' }} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
