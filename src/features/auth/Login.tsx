import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import AuthForm from './AuthForm';
import { UserIcon } from '../../shared/ui/icons';

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
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="auth-card">
          <div className="auth-brand">
            <UserIcon size={32} style={{ verticalAlign: 'middle' }} />
            <span className="auth-brand-name">OpenCards</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--color-primary)', borderRight: '2px solid transparent', animation: 'spin 1s linear infinite' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return <AuthForm mode="login" setMode={() => {}} onAuthenticated={() => navigate('/')} />;
}
