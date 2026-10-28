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

describe('Flashcard', () => {
  it('revela o verso espelhado quando nao virado', () => {
    render(<Flashcard card={card} flipped={false} onFlip={() => {}} />);
    const verso = screen.getByTestId('flashcard-verso-texto');
    // verso (resposta) exposto espelhado via transform: scaleX(-1)
    expect(verso).toHaveStyle({ transform: 'scaleX(-1)' });
    expect(verso).toHaveTextContent('Paris');
    // a frente (pergunta) nao fica visível enquanto o card nao for virado
    expect(screen.queryByText('Qual é a capital da França?')).not.toBeInTheDocument();
    expect(screen.getByText('Clique para revelar a resposta')).toBeInTheDocument();
  });

  it('mostra frente e verso quando virado', () => {
    render(<Flashcard card={card} flipped={true} onFlip={() => {}} />);
    expect(screen.getByText('Qual é a capital da França?')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('alternna ao clicar no card', () => {
    const onFlip = vi.fn();
    render(<Flashcard card={card} flipped={false} onFlip={onFlip} />);
    fireEvent.click(screen.getByTestId('flashcard-verso'));
    expect(onFlip).toHaveBeenCalledTimes(1);
  });
});
