import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import { AuthProvider } from './AuthProvider';
import { CardsProvider } from './CardsProvider';
import Deck from '../../features/decks/Deck';

// Mock do supabase client (evita Realtime contra URL inválida)
vi.mock('../../shared/lib/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock das APIs de card e deck
vi.mock('../../entities/card/api/cards', () => ({
  getDecks: vi.fn().mockResolvedValue([
    { id: 'd1', user_id: 'u1', name: 'Cardio', tag: null, created_at: '2024-01-01T00:00:00Z', cards_count: 0 },
  ]),
  getDeck: vi.fn().mockResolvedValue({
    id: 'd1', user_id: 'u1', name: 'Cardio', tag: null, created_at: '2024-01-01T00:00:00Z', cards_count: 0,
  }),
  getCards: vi.fn().mockResolvedValue([]),
  getDeckStats: vi.fn().mockResolvedValue(null),
  createCard: vi.fn(),
  updateCard: vi.fn(),
  deleteCard: vi.fn(),
  upsertCard: vi.fn(),
  createDeck: vi.fn(),
  updateDeck: vi.fn(),
  deleteDeck: vi.fn(),
  uploadImage: vi.fn(),
}));

// Mock das APIs de auth
vi.mock('../../entities/user/api/auth', () => ({
  getSession: vi.fn().mockResolvedValue({ user: null }),
  getCurrentUser: vi.fn().mockResolvedValue(null),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

const renderWithProviders = (ui: React.ReactNode, initialEntries: string[] = ['/']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <CardsProvider>{ui}</CardsProvider>
      </AuthProvider>
    </MemoryRouter>
  );

describe('AuthProvider — B-302: estabilidade do user (não re-render desnecessário)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não entra em loop com múltiplos eventos USER_UPDATED do mesmo id', async () => {
    const { onAuthStateChange } = await import('../../entities/user/api/auth');

    // Renderiza primeiro para disparar o useEffect que chama onAuthStateChange
    renderWithProviders(<div data-testid="user-provider">teste</div>);

    // Agora onAuthStateChange já foi chamado pelo useEffect do AuthProvider
    const callback = vi.mocked(onAuthStateChange).mock.calls[0][0];

    // Dispara múltiplos eventos com o mesmo id — não deve causar loop infinito
    act(() => {
      callback('USER_UPDATED', { user: { id: 'u1' } });
      callback('USER_UPDATED', { user: { id: 'u1' } });
      callback('USER_UPDATED', { user: { id: 'u1' } });
      callback('USER_UPDATED', { user: { id: 'u1' } });
      callback('USER_UPDATED', { user: { id: 'u1' } });
    });

    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
  });

  it('aceita mudança de id de user sem loop', async () => {
    const { onAuthStateChange } = await import('../../entities/user/api/auth');

    renderWithProviders(<div data-testid="user-provider">teste</div>);

    const callback = vi.mocked(onAuthStateChange).mock.calls[0][0];

    act(() => {
      callback('USER_UPDATED', { user: { id: 'u1' } });
      callback('USER_UPDATED', { user: { id: 'u2' } });
      callback('USER_UPDATED', { user: { id: 'u1' } });
    });

    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
  });
});

describe('Deck — B-302: não re-render em loop com múltiplas atualizações', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não entra em loop infinito com múltiplas atualizações de decks/cards', async () => {
    const { getDecks, getDeck, getCards } = await import('../../entities/card/api/cards');
    vi.mocked(getDecks).mockResolvedValue([
      { id: 'd1', user_id: 'u1', name: 'Cardio', tag: null, created_at: '2024-01-01T00:00:00Z', cards_count: 0 },
    ]);
    vi.mocked(getDeck).mockResolvedValue({
      id: 'd1', user_id: 'u1', name: 'Cardio', tag: null, created_at: '2024-01-01T00:00:00Z', cards_count: 0,
    });
    vi.mocked(getCards).mockResolvedValue([]);

    const { unmount } = renderWithProviders(
      <Routes>
        <Route path="/decks/:id" element={<Deck />} />
      </Routes>,
      ['/decks/d1']
    );

    // Aguarda o load do Deck completar
    await screen.findByText('Cardio');

    // Se chegou aqui sem travar (loop infinito), o teste passa
    unmount();
  }, 5000);

  it('múltiplas montagens/desmontagens do Deck não causam loop', async () => {
    const { getDecks, getDeck, getCards } = await import('../../entities/card/api/cards');
    vi.mocked(getDecks).mockResolvedValue([
      { id: 'd1', user_id: 'u1', name: 'Cardio', tag: null, created_at: '2024-01-01T00:00:00Z', cards_count: 0 },
    ]);
    vi.mocked(getDeck).mockResolvedValue({
      id: 'd1', user_id: 'u1', name: 'Cardio', tag: null, created_at: '2024-01-01T00:00:00Z', cards_count: 0,
    });
    vi.mocked(getCards).mockResolvedValue([]);

    for (let i = 0; i < 3; i++) {
      const { unmount } = renderWithProviders(
        <Routes>
          <Route path="/decks/:id" element={<Deck />} />
        </Routes>,
        ['/decks/d1']
      );
      await screen.findByText('Cardio');
      unmount();
    }
  }, 5000);
});
