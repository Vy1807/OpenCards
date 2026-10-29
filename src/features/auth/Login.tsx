import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { LogoIcon } from '../../shared/ui/icons';

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="page login-loading">
        <div className="auth-card">
          <div className="auth-brand">
            <LogoIcon size={32} style={{ verticalAlign: 'middle' }} />
            <span className="auth-brand-name">OpenCards</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div
              className="spinner"
              style={{
                width: '32px',
                height: '32px',
                border: '2px solid var(--role-acao-principal)',
                borderRight: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      {/* Esquerda — fundo Principal (ação principal) */}
      <div className="auth-brand-panel">
        <div className="auth-brand">
          <LogoIcon />
          <span className="auth-brand-name">OpenCards</span>
        </div>
        <h1 className="auth-welcome-title">Bem-vinda de volta</h1>
        <p className="auth-welcome-subtitle">
          Seus baralhos e sua rotina de revisão, num só lugar.
        </p>
        <p className="auth-welcome-subtitle">
          Crie cartões de pergunta e resposta e revise na hora certa.
        </p>
        <div className="auth-decorative-cards">
          <div className="auth-card-front">
            <span className="card-label">Pergunta</span>
            <p className="card-text">Qual é o marca-passo natural do coração?</p>
          </div>
          <div className="auth-card-back">
            <span className="card-label">Resposta</span>
            <p className="card-text">O nó sinoatrial.</p>
          </div>
        </div>
      </div>

      {/* Direita — fundo Fundo, formulário centralizado */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-mode-toggle">
            <button
              type="button"
              className="mode-toggle-btn active"
              onClick={() => {}}
            >
              Entrar
            </button>
            <button
              type="button"
              className="mode-toggle-btn"
              onClick={() => {}}
            >
              Criar conta
            </button>
          </div>

          <h2 className="auth-form-title">Bem-vinda de volta</h2>
          <p className="auth-form-subtitle">
            Entre com seu e-mail e sua senha para continuar estudando.
          </p>

          <form onClick={() => {}}>
            <div className="auth-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="nome@email.com"
                autoComplete="email"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">
                Senha
                <a href="#" className="auth-forgot">
                  Esqueci minha senha
                </a>
              </label>
              <div className="auth-password-input">
                <input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  autoComplete="current-password"
                />
                <button type="button" className="auth-toggle-password">
                  <span className="eye-icon">👁</span>
                </button>
              </div>
            </div>
            <button type="button" className="auth-btn-primary">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
