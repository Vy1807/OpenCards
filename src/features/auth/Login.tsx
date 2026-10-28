import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, signUp } from '../../entities/user/api/auth';
import { UserIcon } from '../../shared/ui/icons';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
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
      navigate(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: '400px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <UserIcon size={28} style={{ flexShrink: 0 }} />{' '}
        {mode === 'login' ? 'Entrar' : 'Criar conta'}
      </h1>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="card section">
        <div style={{ marginBottom: '1rem' }}>
          <label className="label">E-mail</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label">Senha</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
          style={{ minHeight: '44px', width: '100%' }}
        >
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
        {mode === 'login' ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
        <button
          type="button"
          className="btn"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          style={{ color: 'var(--accent)', fontWeight: '600', padding: 0 }}
        >
          {mode === 'login' ? 'Crie uma' : 'Faça login'}
        </button>
      </p>
    </div>
  );
}
