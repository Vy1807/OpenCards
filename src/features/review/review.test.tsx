import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import Flashcard from './Flashcard';
import Review from './Review';
import { AuthProvider, CardsProvider } from '../../app/providers';

// Mock do useImageUrl para não depender do Supabase em testes unitários
vi.mock('../../shared/lib/useImageUrl', () => ({
  useImageUrl: vi.fn(() => null),
}));

// Mock do useDeck para controlar cards e answerCard
vi.mock('../decks/useDeck', () => ({
  useDeck: vi.fn(),
}));

import { useDeck } from '../decks/useDeck';

const mockUseDeck = useDeck as unknown as Mock;

describe('Flashcard — B-301: mostra pergunta primeiro, resposta depois de virar', () => {
  const card = {
    id: 'c1',
    card_code: '1',
    front_text: 'Qual é a capital do Brasil?',
    back_text: 'Brasília',
    front_image_path: null,
    back_image_path: null,
  };

  it('começa na frente (pergunta) com rótulo "Pergunta" e não mostra a resposta', () => {
    render(<Flashcard card={card} flipped={false} onFlip={vi.fn()} />);

    expect(screen.getByTestId('flashcard-frente')).toBeInTheDocument();
    expect(screen.getByText('Qual é a capital do Brasil?')).toBeInTheDocument();
    expect(screen.queryByText('Brasília')).not.toBeInTheDocument();
    expect(screen.queryByTestId('flashcard-verso')).not.toBeInTheDocument();
  });

  it('clicar no card chama onFlip para virar para a resposta', () => {
    const onFlip = vi.fn();
    render(<Flashcard card={card} flipped={false} onFlip={onFlip} />);

    fireEvent.click(screen.getByTestId('flashcard-frente'));

    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it('quando flipado, mostra verso com "Resposta" e não mostra a pergunta', () => {
    render(<Flashcard card={card} flipped={true} onFlip={vi.fn()} />);

    expect(screen.getByTestId('flashcard-verso')).toBeInTheDocument();
    expect(screen.getByText('Brasília')).toBeInTheDocument();
    expect(screen.queryByText('Qual é a capital do Brasil?')).not.toBeInTheDocument();
    expect(screen.queryByTestId('flashcard-frente')).not.toBeInTheDocument();
  });
});

describe('Review — B-301: avaliação bloqueada antes de virar o card', () => {
  const mockDeckCards = [
    {
      id: 'c1',
      deck_id: 'd1',
      user_id: 'u1',
      card_code: '1',
      front_text: 'Pergunta 1',
      back_text: 'Resposta 1',
      front_image_path: null,
      back_image_path: null,
      created_at: '2024-01-01T00:00:00Z',
      box: 0,
      due_at: '2020-01-01T00:00:00Z',
      review_count: 0,
      last_reviewed_at: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeck.mockReturnValue({
      cards: mockDeckCards,
      loading: false,
      error: null,
      refresh: vi.fn().mockResolvedValue(undefined),
      answerCard: vi.fn().mockResolvedValue({ ...mockDeckCards[0], box: 1 }),
      updateDeck: vi.fn(),
      deleteDeck: vi.fn(),
      createCard: vi.fn(),
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
      upsertCard: vi.fn(),
      getDeckStats: vi.fn(),
    });
  });

  const renderReview = (initialEntries: string[] = ['/decks/d1/review']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <CardsProvider>
            <Routes>
              <Route path="/decks/:id/review" element={<Review />} />
            </Routes>
          </CardsProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('botões de avaliação estão desabilitados inicialmente (card não virado)', async () => {
    renderReview();

    await waitFor(() => {
      expect(screen.getByText('Pergunta 1')).toBeInTheDocument();
    });

    const dificil = screen.getByRole('button', { name: /Difícil/ });
    const bom = screen.getByRole('button', { name: /Bom/ });
    const facil = screen.getByRole('button', { name: /Fácil/ });

    expect(dificil).toBeDisabled();
    expect(bom).toBeDisabled();
    expect(facil).toBeDisabled();
  });

  it('após virar o card, botões de avaliação ficam habilitados', async () => {
    renderReview();

    await waitFor(() => {
      expect(screen.getByText('Pergunta 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('flashcard-frente'));

    await waitFor(() => {
      expect(screen.getByText('Resposta 1')).toBeInTheDocument();
    });

    const dificil = screen.getByRole('button', { name: /Difícil/ });
    const bom = screen.getByRole('button', { name: /Bom/ });
    const facil = screen.getByRole('button', { name: /Fácil/ });

    expect(dificil).not.toBeDisabled();
    expect(bom).not.toBeDisabled();
    expect(facil).not.toBeDisabled();
  });

  it('Enter vira o card (teclado)', async () => {
    renderReview();

    await waitFor(() => {
      expect(screen.getByText('Pergunta 1')).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Resposta 1')).toBeInTheDocument();
    });
  });
});
