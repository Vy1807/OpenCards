import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import { AuthProvider } from '../app/providers';
import Login from '../features/auth/Login';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';

// Mock Supabase auth — fluxo completo: signup → login → session → logout
vi.mock('../entities/user/api/auth', () => {
  let sessionUser: { id: string; email: string } | null = null;
  return {
    getSession: vi.fn().mockImplementation(() =>
      Promise.resolve({ user: sessionUser })
    ),
    getCurrentUser: vi.fn().mockImplementation(() =>
      Promise.resolve(sessionUser)
    ),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signIn: vi.fn().mockImplementation(async (email: string, password: string) => {
      if (email === 'user@test.com' && password === 'password123') {
        sessionUser = { id: 'u1', email };
        return { user: sessionUser, error: null };
      }
      return { user: null, error: { message: 'Credenciais inválidas' } };
    }),
    signUp: vi.fn().mockImplementation(async (email: string, password: string) => {
      if (email && password) {
        sessionUser = { id: 'u1', email };
        return { user: sessionUser, error: null };
      }
      return { user: null, error: { message: 'Erro ao cadastrar' } };
    }),
    signOut: vi.fn().mockImplementation(async () => {
      sessionUser = null;
      return { error: null };
    }),
  };
});

const renderApp = (initialEntries: string[] = ['/login']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div data-testid="home">Home autenticada</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Integração Auth — Fluxo completo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login válido → sessão persistente → logout limpa sessão', async () => {
    const { signIn } = await import('../entities/user/api/auth');
    const { signOut } = await import('../entities/user/api/auth');
    const { getCurrentUser } = await import('../entities/user/api/auth');

    renderApp(['/login']);

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/Senha/), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/ }));

    await waitFor(() => {
      expect(vi.mocked(signIn)).toHaveBeenCalledWith('user@test.com', 'password123');
    });

    // Sessão persistente
    const user = await getCurrentUser();
    expect(user).toEqual({ id: 'u1', email: 'user@test.com' });

    // Logout limpa sessão
    await signOut();
    const userAfterLogout = await getCurrentUser();
    expect(userAfterLogout).toBeNull();
    expect(vi.mocked(signOut)).toHaveBeenCalled();
  });

  it('login inválido → não cria sessão', async () => {
    const { signIn } = await import('../entities/user/api/auth');
    const { getCurrentUser } = await import('../entities/user/api/auth');

    renderApp(['/login']);

    fireEvent.change(screen.getByLabelText(/E-mail/), {
      target: { value: 'wrong@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/Senha/), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/ }));

    await waitFor(() => {
      expect(vi.mocked(signIn)).toHaveBeenCalledWith('wrong@test.com', 'wrongpass');
    });

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });
});
