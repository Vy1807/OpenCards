import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Flashcard from './Flashcard';

const card = {
  id: 'c1',
  card_code: 'CARD-001',
  front_text: 'Qual é a capital da França?',
  back_text: 'Paris',
  front_image_path: null,
  back_image_path: null,
};

describe('Flashcard — B-303: texto não espelhado', () => {
  it('começa na frente mostrando a pergunta (não espelhada)', () => {
    render(<Flashcard card={card} flipped={false} onFlip={vi.fn()} />);

    expect(screen.getByText('Qual é a capital da França?')).toBeInTheDocument();
    expect(screen.queryByText('Paris')).not.toBeInTheDocument();
    expect(screen.getByText('Clique para revelar a resposta')).toBeInTheDocument();
  });

  it('quando virado, mostra a resposta (não espelhada)', () => {
    render(<Flashcard card={card} flipped={true} onFlip={vi.fn()} />);

    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.queryByText('Qual é a capital da França?')).not.toBeInTheDocument();
    expect(screen.getByText('Clique para continuar')).toBeInTheDocument();
  });

  it('texto não tem transform scaleX(-1) (não espelhado)', () => {
    const { container } = render(<Flashcard card={card} flipped={false} onFlip={vi.fn()} />);
    const textoFrente = container.querySelector('[data-testid="flashcard-frente-texto"]');
    expect(textoFrente).not.toHaveStyle({ transform: 'scaleX(-1)' });

    const { container: containerFlipped } = render(<Flashcard card={card} flipped={true} onFlip={vi.fn()} />);
    const textoVerso = containerFlipped.querySelector('[data-testid="flashcard-verso-texto"]');
    expect(textoVerso).not.toHaveStyle({ transform: 'scaleX(-1)' });
  });

  it('alternna ao clicar no card', () => {
    const onFlip = vi.fn();
    render(<Flashcard card={card} flipped={false} onFlip={onFlip} />);
    fireEvent.click(screen.getByTestId('flashcard-frente'));
    expect(onFlip).toHaveBeenCalledTimes(1);
  });
});
