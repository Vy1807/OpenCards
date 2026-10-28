import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, CardsProvider } from '../../app/providers';
import Import from './Import';

vi.mock('../../entities/card/api/cards', () => ({
  getDecks: vi.fn(),
  upsertCard: vi.fn(),
}));

import { getDecks, upsertCard } from '../../entities/card/api/cards';

const decks = [
  {
    id: 'd1',
    user_id: 'u1',
    name: 'Cardiologia',
    tag: '#estudo',
    created_at: '2024-01-01T00:00:00Z',
    cards_count: 5,
  },
];

function renderImport() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CardsProvider>
          <Import />
        </CardsProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Import (tela de importacao em lote)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDecks).mockResolvedValue(decks);
    vi.mocked(upsertCard).mockResolvedValue({ id: 'c1' } as never);
  });

  it('renderiza seletor de baralho, dropzone e area de texto; botao de importacao inicia desabilitado', () => {
    renderImport();
    expect(screen.getByRole('combobox', { name: /Baralho de destino/ })).toBeInTheDocument();
    expect(screen.getByText(/Escolher arquivo .json/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/CARD-001/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Importar cards/ })).toBeDisabled();
  });

  it('bloqueia a importacao e lista itens invalidos quando o JSON esta mal formado', async () => {
    renderImport();
    const textarea = screen.getByPlaceholderText(/CARD-001/);
    fireEvent.change(textarea, { target: { value: '{ json quebrado' } });
    fireEvent.click(screen.getByRole('button', { name: /Validar/ }));

    await waitFor(() => expect(screen.getByText(/Itens inválidos:/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Importar cards/ })).toBeDisabled();
  });

  it('habilita a importacao com JSON valido e chama upsertCard por item valido', async () => {
    renderImport();
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Cardiologia' })).toBeInTheDocument()
    );

    const textarea = screen.getByPlaceholderText(/CARD-001/);
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify([
          { id: 'CARD-001', question: 'Qual e a capital?', answer: 'Brasilia' },
          { id: 'CARD-002', question: '2 + 2?', answer: '4' },
        ]),
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /Validar/ }));

    await waitFor(() => expect(screen.getByText(/Válidos:/)).toBeInTheDocument());
    const select = screen.getByRole('combobox', { name: /Baralho de destino/ });
    fireEvent.change(select, { target: { value: 'd1' } });

    fireEvent.click(screen.getByRole('button', { name: /Importar cards/ }));

    await waitFor(() => expect(vi.mocked(upsertCard)).toHaveBeenCalledTimes(2));
    expect(vi.mocked(upsertCard).mock.calls[0][0]).toMatchObject({
      deck_id: 'd1',
      card_code: 'CARD-001',
      front_text: 'Qual e a capital?',
      back_text: 'Brasilia',
    });
    await waitFor(() => expect(screen.getByText(/importados com sucesso/)).toBeInTheDocument());
  });

  it('le um arquivo JSON via drop (FileReader) e habilita a validacao', async () => {
    renderImport();
    const dropzone = screen.getByText(/Escolher arquivo .json/).parentElement as HTMLElement;
    const file = new File(
      [JSON.stringify([{ id: 'CARD-DROP', question: 'Q?', answer: 'A' }])],
      'cartoes.json',
      { type: 'application/json' }
    );

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() =>
      expect((screen.getByPlaceholderText(/CARD-001/) as HTMLInputElement).value).toContain(
        'CARD-DROP'
      )
    );
    fireEvent.click(screen.getByRole('button', { name: /Validar/ }));
    await waitFor(() => expect(screen.getByText(/Válidos:/)).toBeInTheDocument());
  });
});
