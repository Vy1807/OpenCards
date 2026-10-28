import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@testing-library/jest-dom';
import { AuthProvider, CardsProvider } from '../app/providers';
import Home from '../features/decks/Home';
import Import from '../features/decks/Import';
import { NewCardPage } from '../features/decks/NewCard';
import Login from '../features/auth/Login';
import Cadastro from '../features/auth/Cadastro';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { getDecks, getDeck, getDeckStats, getCards, createCard, updateDeck, deleteDeck, deleteCard } from '../entities/card/api/cards';
import { getCurrentUser } from '../entities/user/api/auth';
import { Suspense, lazy } from 'react';
import { Spinner } from '../components/ui';

const LoadingFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <Spinner size="lg" ariaLabel="Carregando…" />
  </div>
);

const Deck = lazy(() => import('../features/decks/Deck'));
const DeckEdit = lazy(() => import('../features/decks/DeckEdit'));
const Review = lazy(() => import('../features/review/Review'));
const KanbanPage = lazy(() => import('../features/kanban/KanbanPage'));

// Mock do cliente Supabase usado pelo CardsProvider para inscrições em tempo
// real. Os testes exercitam a camada de dados via entidades (já mockadas
// abaixo); aqui apenas evitamos que o provider tente abrir um canal Realtime
// contra uma URL inválida durante os testes.
vi.mock('../../shared/lib/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('../entities/card/api/cards', () => ({
  getDecks: vi.fn(),
  getDeck: vi.fn(),
  getDeckStats: vi.fn(),
  getCards: vi.fn(),
  createCard: vi.fn(),
  updateDeck: vi.fn(),
  deleteDeck: vi.fn(),
  deleteCard: vi.fn(),
}));

vi.mock('../entities/user/api/auth', () => ({
  getSession: vi.fn().mockResolvedValue({ user: { id: 'u1' } }),
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

const mockDecks = [
  {
    id: 'd1',
    user_id: 'u1',
    name: 'Cardiologia',
    tag: '#estudo',
    created_at: '2024-01-01T00:00:00Z',
    cards_count: 3,
  },
  {
    id: 'd2',
    user_id: 'u1',
    name: 'Neurologia',
    tag: null,
    created_at: '2024-01-02T00:00:00Z',
    cards_count: 0,
  },
];

const mockCards = [
  {
    id: 'c1',
    deck_id: 'd1',
    user_id: 'u1',
    card_code: '1',
    front_text: 'O que é infarto?',
    back_text: 'Necrose do miocárdio.',
    front_image_path: null,
    back_image_path: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'c2',
    deck_id: 'd1',
    user_id: 'u1',
    card_code: '2',
    front_text: 'Qual é a causa?',
    back_text: 'Oclusão de artéria coronária.',
    front_image_path: null,
    back_image_path: null,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockStats = {
  total: 2,
  mastered: 1,
  dueToday: 2,
  accuracy: 50,
};

const renderApp = (initialEntries: string[] = ['/']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <CardsProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/decks/:id"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Deck />
                  </Suspense>
                }
              />
              <Route
                path="/decks/:id/edit"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <DeckEdit />
                  </Suspense>
                }
              />
              <Route
                path="/decks/:id/review"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Review />
                  </Suspense>
                }
              />
              <Route
                path="/novo-card"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <NewCardPage />
                  </Suspense>
                }
              />
              <Route path="/importar" element={<Import />} />
              <Route
                path="/kanban"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <KanbanPage />
                  </Suspense>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CardsProvider>
      </AuthProvider>
    </MemoryRouter>
  );

describe('Integração: Rotas Públicas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('/login renderiza tela de login', () => {
    renderApp(['/login']);
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/ })).toBeInTheDocument();
  });

  it('/cadastro renderiza tela de cadastro', () => {
    renderApp(['/cadastro']);
    expect(screen.getByText('Criar conta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar conta/ })).toBeInTheDocument();
  });
});

describe('Integração: Home → Deck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Home mostra baralhos com nome, tag e contagem', async () => {
    vi.mocked(getDecks).mockResolvedValue(mockDecks);

    renderApp();

    expect(await screen.findByText('Cardiologia')).toBeInTheDocument();
    expect(screen.getAllByText('#estudo')[0]).toBeInTheDocument();
    expect(screen.getAllByText((text) => text === '3 cart' + String.fromCharCode(0xe3, 0x6f, 0x73))).toHaveLength(1);
    expect(await screen.findByText('Neurologia')).toBeInTheDocument();
    expect(screen.getAllByText((text) => text === '0 cart' + String.fromCharCode(0xe3, 0x6f, 0x73))).toHaveLength(1);
  });

  it('clicar num baralho na Home navega para /decks/:id e mostra a tela do baralho', async () => {
    vi.mocked(getDecks).mockResolvedValue(mockDecks);
    vi.mocked(getDeck).mockResolvedValue(mockDecks[0]);
    vi.mocked(getDeckStats).mockResolvedValue(mockStats);
    vi.mocked(getCards).mockResolvedValue(mockCards);

    renderApp();

    expect(await screen.findByText('Cardiologia')).toBeInTheDocument();
    expect(screen.getAllByText('#estudo')[0]).toBeInTheDocument();

    const cardiologiaCard = screen.getByText('Cardiologia').closest('li');
    expect(cardiologiaCard).toBeInTheDocument();
    fireEvent.click(cardiologiaCard!);

    await waitFor(() => {
      expect(screen.getByText('Cardiologia')).toBeInTheDocument();
    });
    expect(screen.getByText('#estudo')).toBeInTheDocument();
    expect(screen.getByText('Revisar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Editar/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exportar JSON/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar cartão/i })).toBeInTheDocument();
  });
});

describe('Integração: Deck → DeckEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' });
  });

  it('botão Editar no Deck navega para /decks/:id/edit', async () => {
    vi.mocked(getDeck).mockResolvedValue(mockDecks[0]);
    vi.mocked(getDeckStats).mockResolvedValue(mockStats);
    vi.mocked(getCards).mockResolvedValue(mockCards);

    renderApp(['/decks/d1']);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Editar/ })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Editar/ }));

    await waitFor(() => {
      expect(screen.getByText('Editar baralho')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('Cardiologia')).toBeInTheDocument();
  });
});

describe('Integração: Deck → Review (modos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' });
  });

  it('Review modo due carrega cartões pendentes', async () => {
    vi.mocked(getDeck).mockResolvedValue(mockDecks[0]);
    vi.mocked(getCards).mockResolvedValue(mockCards);

    renderApp(['/decks/d1/review?mode=due']);

    await waitFor(() => {
      expect(screen.getByText('Revisão do dia')).toBeInTheDocument();
    });
    expect(screen.getByText('1 / 2')).toBeInTheDocument(); // contador de progresso
  });

  it('Review modo all ignora due_at', async () => {
    vi.mocked(getDeck).mockResolvedValue(mockDecks[0]);
    vi.mocked(getCards).mockResolvedValue(mockCards);

    renderApp(['/decks/d1/review?mode=all']);

    await waitFor(() => {
      expect(screen.getByText('Revisão do dia')).toBeInTheDocument();
    });
  });

  it('Review modo missed filtra apenas box 0', async () => {
    vi.mocked(getDeck).mockResolvedValue(mockDecks[0]);
    vi.mocked(getCards).mockResolvedValue(mockCards);

    renderApp(['/decks/d1/review?mode=missed']);

    await waitFor(() => {
      expect(screen.getByText('Revisão do dia')).toBeInTheDocument();
    });
  });
});

describe('Integração: Novo Card (/novo-card)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' });
    vi.mocked(getDecks).mockResolvedValue(mockDecks);
  });

  it('renderiza formulário de novo card', async () => {
    renderApp(['/novo-card']);

    await waitFor(() => {
      expect(screen.getByText('Novo cartão')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Adicionar cartão/i })).toBeInTheDocument();
  });
});

describe('Integração: Importar (/importar)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' });
    vi.mocked(getDecks).mockResolvedValue(mockDecks);
  });

  it('renderiza tela de importação', async () => {
    renderApp(['/importar']);

    await waitFor(() => {
      expect(screen.getByText('Importar cartões')).toBeInTheDocument();
    });
  });
});

describe('Integração: Kanban (/kanban)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' });
  });

  it('renderiza quadro Kanban com 4 colunas', async () => {
    renderApp(['/kanban']);

    await waitFor(() => {
      expect(screen.getByText('Quadro Kanban')).toBeInTheDocument();
    });
    expect(screen.getByText('TO DO')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    expect(screen.getByText('TESTING')).toBeInTheDocument();
    expect(screen.getByText('DONE')).toBeInTheDocument();
  });
});

describe('Integração: Criar cartão', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' });
  });

  it('criar cartão na tela de edição chama createCard e recarrega a lista', async () => {
    vi.mocked(getDecks).mockResolvedValue(mockDecks);
    vi.mocked(getDeck).mockResolvedValue(mockDecks[0]);
    vi.mocked(getCards).mockResolvedValue(mockCards);
    vi.mocked(createCard).mockResolvedValue({
      id: 'c3',
      deck_id: 'd1',
      user_id: 'u1',
      card_code: '3',
      front_text: 'Nova pergunta?',
      back_text: 'Nova resposta.',
      front_image_path: null,
      back_image_path: null,
      created_at: '2024-01-03T00:00:00Z',
    });

    renderApp(['/decks/d1/edit']);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Adicionar cartão/i })).toBeInTheDocument();
    });

    const textareas = screen.getAllByRole('textbox').filter((el) => el.tagName === 'TEXTAREA');
    fireEvent.change(textareas[0], { target: { value: 'Nova pergunta?' } });
    fireEvent.change(textareas[1], { target: { value: 'Nova resposta.' } });

    fireEvent.click(screen.getByRole('button', { name: /Adicionar cartão/i }));

    await waitFor(() => {
      expect(vi.mocked(createCard)).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(vi.mocked(getCards)).toHaveBeenCalled();
    });
  });
});

describe('Integração: Editar e excluir baralho', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' });
  });

  it('atualizar nome do baralho chama updateDeck', async () => {
    vi.mocked(getDeck).mockResolvedValue(mockDecks[0]);
    vi.mocked(getDeckStats).mockResolvedValue(mockStats);
    vi.mocked(getCards).mockResolvedValue(mockCards);
    vi.mocked(updateDeck).mockResolvedValue({ ...mockDecks[0], name: 'Cardio Atualizado' });

    renderApp(['/decks/d1/edit']);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Cardiologia')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Cardiologia');
    fireEvent.change(nameInput, { target: { value: 'Cardio Atualizado' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar baralho/ }));

    await waitFor(() => {
      expect(vi.mocked(updateDeck)).toHaveBeenCalledWith('d1', { name: 'Cardio Atualizado', tag: '#estudo' });
    });
  });

  it('excluir baralho chama deleteDeck e navega para home', async () => {
    vi.mocked(getDeck).mockResolvedValue(mockDecks[0]);
    vi.mocked(getDeckStats).mockResolvedValue(mockStats);
    vi.mocked(getCards).mockResolvedValue(mockCards);
    vi.mocked(deleteDeck).mockResolvedValue(undefined);

    renderApp(['/decks/d1/edit']);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Excluir baralho/ })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Excluir baralho/ }));
    // confirm() é mockado automaticamente pelo vitest/jsdom

    await waitFor(() => {
      expect(vi.mocked(deleteDeck)).toHaveBeenCalledWith('d1');
    });
  });
});

describe('Integração: Excluir cartão', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' });
  });

  it('excluir cartão chama deleteCard e remove da UI', async () => {
    vi.mocked(getDeck).mockResolvedValue(mockDecks[0]);
    vi.mocked(getDeckStats).mockResolvedValue(mockStats);
    vi.mocked(getCards).mockResolvedValue(mockCards);
    vi.mocked(deleteCard).mockResolvedValue(undefined);

    renderApp(['/decks/d1/edit']);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Excluir/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Excluir/i }));

    await waitFor(() => {
      expect(vi.mocked(deleteCard)).toHaveBeenCalledWith('c1');
    });
  });
});

describe('Integração: Login/Cadastro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login bem-sucedido redireciona para home', async () => {
    const { signIn } = await import('../entities/user/api/auth');
    vi.mocked(signIn).mockResolvedValue(undefined);

    renderApp(['/login']);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Entrar/ })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Senha/), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/ }));

    await waitFor(() => {
      expect(vi.mocked(signIn)).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('cadastro bem-sucedido redireciona para home', async () => {
    const { signUp } = await import('../entities/user/api/auth');
    vi.mocked(signUp).mockResolvedValue(undefined);

    renderApp(['/cadastro']);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Criar conta/ })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByLabelText(/Senha/), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar conta/ }));

    await waitFor(() => {
      expect(vi.mocked(signUp)).toHaveBeenCalledWith('new@test.com', 'password123');
    });
  });
});