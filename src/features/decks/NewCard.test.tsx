import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('renderiza seção de importação JSON com dropzone, colar texto e botão importar', () => {
    renderNewCard();
    // Abrir aba de importação
    fireEvent.click(screen.getByRole('radio', { name: /Importar JSON/ }));
    expect(screen.getByText('Escolher arquivo .json')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Cole o JSON dos cartões aqui/)).toBeInTheDocument();
    expect(screen.getByText(/Baixar modelo de JSON/)).toBeInTheDocument();
  });

  it('desabilita o botão Salvar card quando pergunta ou resposta estão vazias', () => {
    renderNewCard();
    const salvar = screen.getByRole('button', { name: /Salvar card/ });
    expect(salvar).toBeDisabled();

    // Preencher apenas a pergunta
    const frente = screen.getByPlaceholderText('Digite a pergunta');
    fireEvent.change(frente, { target: { value: 'Qual é a capital?' } });
    expect(salvar).toBeDisabled();

    // Preencher também a resposta
    const verso = screen.getByPlaceholderText('Digite a resposta');
    fireEvent.change(verso, { target: { value: 'Brasília' } });
    expect(salvar).not.toBeDisabled();
  });

  it('exibe contador de caracteres na pergunta e resposta', () => {
    renderNewCard();
    const frente = screen.getByPlaceholderText('Digite a pergunta');
    fireEvent.change(frente, { target: { value: 'Oi' } });
    expect(screen.getByText('2 caracteres')).toBeInTheDocument();
  });

  it('chama onSave ao clicar em Salvar card com dados válidos', async () => {
    const onSave = vi.fn();
    render(<NewCard decks={decks} onSave={onSave} />);

    const frente = screen.getByPlaceholderText('Digite a pergunta');
    const verso = screen.getByPlaceholderText('Digite a resposta');
    fireEvent.change(frente, { target: { value: 'Pergunta teste' } });
    fireEvent.change(verso, { target: { value: 'Resposta teste' } });

    fireEvent.click(screen.getByRole('button', { name: /Salvar card/ }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('limpa o formulário ao clicar em Salvar e criar outro', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<NewCard decks={decks} onSave={onSave} />);

    const frente = screen.getByPlaceholderText('Digite a pergunta');
    const verso = screen.getByPlaceholderText('Digite a resposta');
    fireEvent.change(frente, { target: { value: 'Pergunta' } });
    fireEvent.change(verso, { target: { value: 'Resposta' } });

    fireEvent.click(screen.getByRole('button', { name: /Salvar e criar outro/ }));

    await waitFor(() => {
      expect(frente).toHaveValue('');
      expect(verso).toHaveValue('');
    });
  });

  it('limpa o formulário ao clicar em Cancelar', () => {
    renderNewCard();
    const frente = screen.getByPlaceholderText('Digite a pergunta');
    const verso = screen.getByPlaceholderText('Digite a resposta');
    fireEvent.change(frente, { target: { value: 'Pergunta' } });
    fireEvent.change(verso, { target: { value: 'Resposta' } });

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/ }));

    expect(frente).toHaveValue('');
    expect(verso).toHaveValue('');
  });
});
