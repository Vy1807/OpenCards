import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, signUp } from '../../entities/user/api/auth';
import { UserIcon } from '../../shared/ui/icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

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
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          error={error && mode === 'login' ? error : undefined}
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <Button
          variant="solid"
          type="submit"
          disabled={loading}
          fullWidth
          style={{ minHeight: '44px' }}
        >
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </Button>
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
