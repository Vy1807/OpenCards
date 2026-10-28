import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewCard from './NewCard';

const decks = [
  {
    id: 'd1',
    user_id: 'u1',
    name: 'Cardiologia',
    tag: '#estudo',
    created_at: '2024-01-01T00:00:00Z',
    cards_count: 5,
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

function renderNewCard(props = {}) {
  return render(<NewCard decks={decks} onSave={vi.fn()} {...props} />);
}

describe('NewCard', () => {
  it('renderiza botões "Anexar imagem" nos campos de frente e verso', () => {
    renderNewCard();
    const buttons = screen.getAllByRole('button', { name: /Anexar imagem/ });
    expect(buttons).toHaveLength(2);
  });

  it('atualiza a pré-visualização em tempo real ao digitar frente e verso', () => {
    renderNewCard();
    const frente = screen.getByLabelText('Frente · pergunta');
    const verso = screen.getByLabelText('Verso · resposta');

    fireEvent.change(frente, { target: { value: 'Qual é a capital do Brasil?' } });
    fireEvent.change(verso, { target: { value: 'Brasília' } });

    expect(screen.getByTestId('preview-front')).toHaveTextContent('Qual é a capital do Brasil?');
    expect(screen.getByTestId('preview-back')).toHaveTextContent('Brasília');
  });

  it('exibe "Em dia" no toggle de importação quando alternado para JSON', () => {
    renderNewCard();
    fireEvent.click(screen.getByRole('button', { name: /Importar JSON/ }));
    expect(screen.getByPlaceholderText(/CARD-001/)).toBeInTheDocument();
  });
});
