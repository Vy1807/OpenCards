import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, signUp } from '../../entities/user/api/auth';
import { UserIcon } from '../../shared/ui/icons';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  mode: AuthMode;
  setMode: (next: AuthMode) => void;
  onAuthenticated?: () => void;
}

/**
 * Formulário de autenticação unificado (login/cadastro).
 *
 * - Cartão centralizado com marca OpenCards e frase de boas-vindas
 * - Campos com rótulo visível, toggle mostrar/ocultar senha
 * - Estado de carregamento no botão primário
 * - Mensagens de erro em português
 * - autocomplete correto (email, current-password, new-password)
 * - Enter envia o formulário; foco inicial no e-mail
 * - Respeita o tema atual (variáveis CSS) e contraste AA
 * - Mobile: coluna única; desktop: largura máxima 720px centralizada
 */
export default function AuthForm({ mode, setMode, onAuthenticated }: AuthFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onAuthenticated?.();
      navigate(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  const isLogin = mode === 'login';

  return (
    <div className="page" style={{ maxWidth: '720px', margin: '0 auto', padding: '1rem' }}>
      <div className="auth-card">
        <div className="auth-brand">
          <UserIcon size={32} style={{ verticalAlign: 'middle' }} />
          <span className="auth-brand-name">OpenCards</span>
        </div>

        <h1 className="auth-title">
          {isLogin ? 'Bem-vindo de volta' : 'Criar sua conta'}
        </h1>
        <p className="auth-subtitle">
          {isLogin
            ? 'Faça login para acessar seus baralhos de estudo.'
            : 'Cadastre-se para começar a estudar com flashcards.'}
        </p>

        {error && (
          <p className="auth-error">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">
              E-mail
            </label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete={isLogin ? 'email' : 'new-email'}
              fullWidth
              autoFocus
              error={error && mode === 'login' ? error : undefined}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">
              Senha
            </label>
            <div className="auth-password-wrapper">
              <Input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                fullWidth
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-toggle-password"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-confirm-password">
                Confirmar senha
              </label>
              <Input
                id="auth-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                fullWidth
              />
            </div>
          )}

          <Button
            variant="solid"
            type="submit"
            disabled={loading}
            fullWidth
            style={{ minHeight: '48px' }}
          >
            {loading
              ? 'Aguarde…'
              : isLogin
              ? 'Entrar'
              : 'Criar conta'}
          </Button>
        </form>

        <p className="auth-switch">
          {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
          <button
            type="button"
            onClick={toggleMode}
            className="auth-switch-link"
          >
            {isLogin ? 'Crie uma' : 'Faça login'}
          </button>
        </p>
      </div>
    </div>
  );
}
