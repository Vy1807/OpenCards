import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getCards, type Deck } from '../lib/api'

type Params = { id: string }

export default function Deck() {
  const navigate = useNavigate()
  const { id } = useParams<Params>()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<{ id: string; card_code: string; front_text: string; back_text: string; front_image_path: string | null; back_image_path: string | null }[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const { data: deckData } = await supabase.from('decks').select('*').eq('id', id).single()
      setDeck(deckData)
      const cardsData = await getCards(id)
      setCards(cardsData.map((c) => ({
        id: c.id,
        card_code: c.card_code,
        front_text: c.front_text,
        back_text: c.back_text,
        front_image_path: c.front_image_path,
        back_image_path: c.back_image_path,
      })))
    } catch {
      // deck not found or error
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load, id])

  if (loading) return <div className="page">Carregando...</div>
  if (!deck) return <div className="page">Baralho não encontrado.</div>

  return (
    <div className="page">
      <h1>{deck.name}</h1>
      {deck.tag && <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{deck.tag}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/decks/${id}/review`)}
          style={{ minHeight: '80px', fontSize: '1.25rem' }}
        >
          Revisar
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/decks/${id}/edit`)}
          style={{ minHeight: '80px', fontSize: '1.25rem' }}
        >
          Editar
        </button>
      </div>
      <h2 style={{ marginTop: '2rem' }}>Cartões ({cards.length})</h2>
      {cards.length === 0 ? (
        <p>Nenhum cartão ainda. Adicione um na tela de edição.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cards.map((card) => (
            <li key={card.id} className="card">
              <strong>#{card.card_code}</strong>
              <p style={{ marginTop: '0.25rem' }}>{card.front_text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
