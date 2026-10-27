import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
// @ts-ignore - react-router-dom v7 exports changed but runtime works
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom'
import Home from '../pages/Home'
import Deck from '../pages/Deck'
import DeckEdit from '../pages/DeckEdit'
import {
  getDecks,
  getDeck,
  getCurrentUser,
  getCards,
  createCard,
  getDeckStats,
} from '../lib/api'

vi.mock('../lib/api', () => ({
  getDecks: vi.fn(),
  getDeck: vi.fn(),
  getDeckStats: vi.fn(),
  getCards: vi.fn(),
  createCard: vi.fn(),
  getCurrentUser: vi.fn(),
}))

vi.mock('../lib/supabase', () => {
  const makeQuery = () => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  })

  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      },
      from: vi.fn(() => makeQuery()),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'http://test.url' } }),
        })),
      },
    },
  }
})

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
]

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
]

const mockStats = {
  total: 2,
  mastered: 1,
  dueToday: 2,
  accuracy: 50,
}

describe('Integração: Home → Deck (Bug 1 - corrigido)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Home mostra baralhos com nome, tag e contagem', async () => {
    vi.mocked(getDecks).mockResolvedValue(mockDecks)

    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Cardiologia')).toBeInTheDocument()
    // Tag aparece no span do card (não no option do select)
    expect(screen.getAllByText('#estudo')[0]).toBeInTheDocument()
    expect(screen.getByText('3 cartões')).toBeInTheDocument()
  })

  it('Deck mostra nome, tag, contagem, estatísticas e botões Importar/Exportar/Adicionar cartão', async () => {
    vi.mocked(getDecks).mockResolvedValue(mockDecks)
    vi.mocked(getDeck).mockResolvedValue(mockDecks[0])
    vi.mocked(getDeckStats).mockResolvedValue(mockStats)
    vi.mocked(getCards).mockResolvedValue(mockCards)

    render(
      <MemoryRouter initialEntries={['/decks/d1']}>
        <Routes>
          <Route path="/decks/:id" element={<Deck />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Cardiologia')).toBeInTheDocument()
    expect(screen.getByText('#estudo')).toBeInTheDocument()
    // Cartões listados (contagem vem do getCards)
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()

    // Existem na fase 1:
    expect(screen.getByText('Revisar')).toBeInTheDocument()
    expect(screen.getByText('Editar')).toBeInTheDocument()

    // Existem na fase 2 (bug corrigido):
    expect(screen.getByText(/2 dominados/i)).toBeInTheDocument()
    expect(screen.getByText(/pendentes hoje/i)).toBeInTheDocument()
    expect(screen.getByText(/50%/)).toBeInTheDocument()
    expect(screen.getByText(/Exportar JSON/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Adicionar cartão/i })).toBeInTheDocument()
  })
})

describe('Integração: Criar cartão (Bug 2 - corrigido)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' })
  })

  it('criar cartão na tela de edição chama createCard e recarrega a lista', async () => {
    vi.mocked(getDecks).mockResolvedValue(mockDecks)
    vi.mocked(getDeck).mockResolvedValue(mockDecks[0])
    vi.mocked(getCards).mockResolvedValue(mockCards)
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
    })

    render(
      <MemoryRouter initialEntries={['/decks/d1/edit']}>
        <Routes>
          <Route path="/decks/:id/edit" element={<DeckEdit />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Adicionar cartão/i })).toBeInTheDocument()
    })

    const textareas = screen.getAllByRole('textbox').filter((el) => el.tagName === 'TEXTAREA')
    fireEvent.change(textareas[0], { target: { value: 'Nova pergunta?' } })
    fireEvent.change(textareas[1], { target: { value: 'Nova resposta.' } })

    fireEvent.click(screen.getByRole('button', { name: /Adicionar cartão/i }))

    await waitFor(() => {
      expect(vi.mocked(createCard)).toHaveBeenCalled()
    })

    // onCardAdded deve chamar getCards novamente para recarregar
    await waitFor(() => {
      expect(vi.mocked(getCards)).toHaveBeenCalledTimes(2)
    })
  })
})
