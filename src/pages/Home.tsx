import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDecks, createDeck, type Deck } from '../lib/api'

export default function Home() {
  const navigate = useNavigate()
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDecks()
      setDecks(data)
    } catch {
      setError('Não foi possível carregar os baralhos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nome do baralho é obrigatório.')
      return
    }
    setCreating(true)
    setError('')
    try {
      const deck = await createDeck(name.trim(), tag.trim() || null)
      setDecks([deck, ...decks])
      setName('')
      setTag('')
      navigate(`/decks/${deck.id}`)
    } catch {
      setError('Não foi possível criar o baralho.')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="page">Carregando...</div>

  return (
    <div className="page">
      <h1>Meus Baralhos</h1>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleCreate} className="section">
        <h2>Novo baralho</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="label">Nome</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cardiologia"
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="label">Tag (opcional)</label>
            <input
              className="input"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Ex: #estudo"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={creating}>
            {creating ? 'Criando...' : 'Criar baralho'}
          </button>
        </div>
      </form>

      <h2>Baralhos</h2>
      {decks.length === 0 ? (
        <p>Nenhum baralho ainda. Crie o seu primeiro!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {decks.map((deck) => (
            <li key={deck.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/decks/${deck.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{deck.name}</h3>
                  {deck.tag && <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{deck.tag}</span>}
                </div>
                <span style={{ fontWeight: '600', color: 'var(--accent)' }}>
                  {`${deck.cards_count ?? 0} ${deck.cards_count === 1 ? 'cartão' : 'cartões'}`}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
