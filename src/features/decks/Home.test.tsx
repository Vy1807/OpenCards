import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
// @ts-expect-error - react-router-dom v7 tipos não exportam esses membros no .d.ts, mas funcionam em tempo de execução.
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
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
        <Home />
      </MemoryRouter>
    );

    expect(await screen.findByText('Cardiologia')).toBeInTheDocument();
    expect(screen.getAllByText('#estudo')[0]).toBeInTheDocument();
    expect(await screen.findByText('5 cartões')).toBeInTheDocument();
    expect(await screen.findByText('Neurologia')).toBeInTheDocument();
    expect(await screen.findByText('0 cartões')).toBeInTheDocument();
  });

  it('renders "Novo baralho" button', async () => {
    vi.mocked(getDecks).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Criar baralho/)).toBeInTheDocument();
  });
});
