import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { AuthProvider, CardsProvider } from '../../app/providers';
import Home from './Home';
import { getDecks } from '../../entities/card/api/cards';

vi.mock('../../entities/card/api/cards', () => ({
  getDecks: vi.fn(),
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows deck name, tag, and card count', async () => {
    vi.mocked(getDecks).mockResolvedValue([
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
    ]);

    render(
      <MemoryRouter>
        <AuthProvider>
          <CardsProvider>
            <Home />
          </CardsProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Cardiologia')).toBeInTheDocument();
    expect(screen.getAllByText('#estudo')[0]).toBeInTheDocument();
    expect(screen.getAllByText((text) => text === '5 cart' + String.fromCharCode(0xe3, 0x6f, 0x73))).toHaveLength(1);
    expect(await screen.findByText('Neurologia')).toBeInTheDocument();
    expect(screen.getAllByText((text) => text === '0 cart' + String.fromCharCode(0xe3, 0x6f, 0x73))).toHaveLength(1);
  });

  it('renders "+ Novo baralho" button that opens the create form', async () => {
    vi.mocked(getDecks).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <AuthProvider>
          <CardsProvider>
            <Home />
          </CardsProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Aguarda o estado carregado
    await waitFor(() => {
      expect(screen.queryByText(/Carregando/)).not.toBeInTheDocument();
    });

    // Botão de criar está colapsado por padrão
    expect(screen.getByRole('button', { name: /\+ Novo baralho/ })).toBeInTheDocument();
    expect(screen.queryByText(/Criar baralho/)).not.toBeInTheDocument();

    // Clicar abre o formulário
    fireEvent.click(screen.getByRole('button', { name: /\+ Novo baralho/ }));
    expect(await screen.findByText(/Criar baralho/)).toBeInTheDocument();
  });
});
