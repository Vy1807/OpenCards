import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import { AuthProvider, CardsProvider } from '../app/providers';
import Home from '../features/decks/Home';
import { getDecks, getDeck, getCards, createCard } from '../entities/card/api/cards';
import { getCurrentUser } from '../entities/user/api/auth';

// Mock Supabase client (evita Realtime contra URL inválida)
vi.mock('../../shared/lib/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock API cards — simula isolamento RLS: cada usuário só vê seus próprios decks/cards
vi.mock('../entities/card/api/cards', () => ({
  getDecks: vi.fn(),
  getDeck: vi.fn(),
  getCards: vi.fn(),
  createCard: vi.fn(),
}));

// Mock Auth — usuário fixo por teste
vi.mock('../entities/user/api/auth', () => ({
  getSession: vi.fn().mockResolvedValue({ user: { id: 'u1' } }),
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

const mockDecksUserA = [
  { id: 'dA1', user_id: 'u1', name: 'Cardio A', tag: null, created_at: '2024-01-01T00:00:00Z', cards_count: 2 },
  { id: 'dA2', user_id: 'u1', name: 'Neuro A', tag: null, created_at: '2024-01-02T00:00:00Z', cards_count: 1 },
];

const mockDecksUserB = [
  { id: 'dB1', user_id: 'u2', name: 'Cardio B', tag: null, created_at: '2024-01-01T00:00:00Z', cards_count: 5 },
];

const mockCardsUserA = [
  { id: 'cA1', deck_id: 'dA1', user_id: 'u1', card_code: '1', front_text: 'Pergunta A1', back_text: 'Resposta A1', front_image_path: null, back_image_path: null, created_at: '2024-01-01T00:00:00Z' },
];

const DeckPage = () => (
  <div>
    <h1>Deck</h1>
    <ul>
      <li>Pergunta A1</li>
      <li>Resposta A1</li>
    </ul>
  </div>
);

const renderApp = (userId: string, initialEntries: string[] = ['/']) => {
  vi.mocked(getCurrentUser).mockResolvedValue({ id: userId });
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <CardsProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/decks/:id" element={<DeckPage />} />
          </Routes>
        </CardsProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Integração RLS — Isolamento entre usuários', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('userA não vê decks de userB (RLS: select filtrado por user_id)', async () => {
    vi.mocked(getDecks).mockResolvedValue(mockDecksUserA);
    renderApp('u1');

    await waitFor(() => {
      expect(screen.getByText('Cardio A')).toBeInTheDocument();
      expect(screen.getByText('Neuro A')).toBeInTheDocument();
    });
    expect(screen.queryByText('Cardio B')).not.toBeInTheDocument();
    expect(vi.mocked(getDecks)).toHaveBeenCalled();
  });

  it('userB não vê decks de userA (RLS: select filtrado por user_id)', async () => {
    vi.mocked(getDecks).mockResolvedValue(mockDecksUserB);
    renderApp('u2');

    await waitFor(() => {
      expect(screen.getByText('Cardio B')).toBeInTheDocument();
    });
    expect(screen.queryByText('Cardio A')).not.toBeInTheDocument();
    expect(screen.queryByText('Neuro A')).not.toBeInTheDocument();
  });

  it('userA só acessa seus próprios cards (RLS: cards filtrados por deck_id + user_id)', async () => {
    vi.mocked(getDeck).mockResolvedValue(mockDecksUserA[0]);
    vi.mocked(getCards).mockResolvedValue(mockCardsUserA);

    renderApp('u1', ['/decks/dA1']);

    await waitFor(() => {
      expect(screen.getByText('Pergunta A1')).toBeInTheDocument();
    });
    expect(screen.queryByText('Pergunta B1')).not.toBeInTheDocument();
  });

  it('createCard cria card no deck do usuário autenticado', async () => {
    vi.mocked(createCard).mockResolvedValue({
      id: 'cA2',
      deck_id: 'dA1',
      user_id: 'u1',
      card_code: '2',
      front_text: 'Nova pergunta A',
      back_text: 'Nova resposta A',
      front_image_path: null,
      back_image_path: null,
      created_at: '2024-01-03T00:00:00Z',
    });

    renderApp('u1');

    const result = await vi.mocked(createCard)({
      deck_id: 'dA1',
      card_code: undefined,
      front_text: 'Nova pergunta A',
      back_text: 'Nova resposta A',
      front_image_path: null,
      back_image_path: null,
    });

    expect(result.deck_id).toBe('dA1');
    expect(result.user_id).toBe('u1');
    expect(vi.mocked(createCard)).toHaveBeenCalledWith(
      expect.objectContaining({ deck_id: 'dA1' }),
    );
  });
});
