import { useState, useEffect, useCallback, useMemo } from 'react'
// @ts-ignore - react-router-dom v7 exports changed but runtime works
import { useNavigate } from 'react-router-dom'
import { getDecks, createDeck, type Deck } from '../lib/api'
import { streak } from '../lib/streak'

export default function Home() {
  const navigate = useNavigate()
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')
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

  const allTags = useMemo(
    () => [...new Set(decks.map((d) => d.tag).filter(Boolean))] as string[],
    [decks],
  )

  const filteredDecks = useMemo(() => {
    const s = search.toLowerCase()
    const t = filterTag
    return decks.filter((d) => {
      const matchName = d.name.toLowerCase().includes(s)
      const matchTag = t ? d.tag === t : true
      return matchName && matchTag
    })
  }, [decks, search, filterTag])

  const currentStreak = streak([], new Date())

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

  if (loading) return (
    <div className="page loading-state">
      <h3>Carregando seus baralhos…</h3>
    </div>
  )

  if (error) {
    return (
      <div className="page error-state">
        <h3>Erro ao carregar</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={load}>Tentar de novo</button>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <h1>Meus Baralhos</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span className="badge">{filteredDecks.length} baralho{filteredDecks.length !== 1 ? 's' : ''}</span>
          <span className="badge badge-neutral">
            {currentStreak} dia{currentStreak !== 1 ? 's' : ''} de estudo
          </span>
        </div>
      </div>

      {error && <p style={{ color: 'var(--err)', marginBottom: '1rem' }}>{error}</p>}

      <form onSubmit={handleCreate} className="card section">
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
            {creating ? 'Criando…' : 'Criar baralho'}
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <label className="label">Buscar por nome</label>
        <input
          className="input"
          style={{ minWidth: '220px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar baralhos…"
        />
        {allTags.length > 0 && (
          <>
            <label className="label">Filtrar por tag</label>
            <select
              className="input"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <option value="">Todas as tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <h2>Baralhos</h2>
      {filteredDecks.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum baralho encontrado</h3>
          <p>Crie o seu primeiro baralho acima.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredDecks.map((deck) => (
            <li
              key={deck.id}
              className="card deck-link section"
              style={{ cursor: 'pointer', textDecoration: 'none' }}
              onClick={() => navigate(`/decks/${deck.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{deck.name}</h3>
                  {deck.tag && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--muted)', marginRight: '0.5rem' }}>
                      {deck.tag}
                    </span>
                  )}
                  <span className="badge badge-neutral">
                    {`${deck.cards_count ?? 0} cartão${deck.cards_count !== 1 ? 's' : ''}`}
                  </span>
                </div>
                <span style={{ fontWeight: '600', color: 'var(--rose-600)' }}>
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
