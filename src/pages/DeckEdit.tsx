import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { updateDeck, deleteDeck, getCards, createCard, updateCard, deleteCard, upsertCard } from '../lib/api'
import { uploadImage } from '../lib/api'
import { parseAndValidateImport } from '../lib/importCards'

type Params = { id: string }

export default function DeckEdit() {
  const navigate = useNavigate()
  const { id } = useParams<Params>()
  const [deck, setDeck] = useState<{ id: string; name: string; tag: string | null } | null>(null)
  const [cards, setCards] = useState<{
    id: string
    card_code: string
    front_text: string
    back_text: string
    front_image_path: string | null
    back_image_path: string | null
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [savingDeck, setSavingDeck] = useState(false)
  const [deckName, setDeckName] = useState('')
  const [deckTag, setDeckTag] = useState('')
  const [error, setError] = useState('')
  const [importOpen, setImportOpen] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const { data: deckData } = await supabase.from('decks').select('*').eq('id', id).single()
      setDeck(deckData)
      setDeckName(deckData.name)
      setDeckTag(deckData.tag ?? '')
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
      setError('Não foi possível carregar o baralho.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load, id])

  const handleSaveDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deckName.trim()) {
      setError('Nome é obrigatório.')
      return
    }
    setSavingDeck(true)
    try {
      await updateDeck(id!, { name: deckName.trim(), tag: deckTag.trim() || null })
      if (deck) setDeck({ ...deck, name: deckName.trim(), tag: deckTag.trim() || null })
    } catch {
      setError('Não foi possível salvar o baralho.')
    } finally {
      setSavingDeck(false)
    }
  }

  const handleDeleteDeck = async () => {
    if (!confirm('Tem certeza que deseja excluir este baralho? Todos os cartões serão removidos.')) return
    try {
      await deleteDeck(id!)
      navigate('/')
    } catch {
      setError('Não foi possível excluir o baralho.')
    }
  }

  if (loading) return <div className="page">Carregando...</div>
  if (!deck) return <div className="page">Baralho não encontrado.</div>

  return (
    <div className="page">
      <h1>Editar baralho</h1>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

      <form onSubmit={handleSaveDeck} className="card section">
        <h2>Baralho</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="label">Nome</label>
            <input className="input" value={deckName} onChange={(e) => setDeckName(e.target.value)} required />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="label">Tag (opcional)</label>
            <input className="input" value={deckTag} onChange={(e) => setDeckTag(e.target.value)} placeholder="Ex: #estudo" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingDeck}>
            {savingDeck ? 'Salvando...' : 'Salvar baralho'}
          </button>
        </div>
        <button
          className="btn btn-danger"
          type="button"
          onClick={handleDeleteDeck}
          style={{ marginTop: '0.75rem' }}
        >
          Excluir baralho
        </button>
      </form>

      <h2 style={{ marginTop: '2rem' }}>Cartões</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button
          className="btn"
          type="button"
          onClick={() => {
            setImportOpen(true)
          }}
          style={{ marginBottom: '0.5rem' }}
        >
          Importar cartões (JSON)
        </button>
      </div>

      {importOpen && (
        <ImportCardForm
          deckId={id!}
          onClose={() => setImportOpen(false)}
          onImported={load}
        />
      )}

      {cards.length === 0 ? (
        <p>Nenhum cartão ainda. Adicione um abaixo.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cards.map((card) => (
            <li key={card.id} className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: '600', color: 'var(--accent)' }}>#{card.card_code}</span>
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => handleDeleteCard(card.id)}
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                >
                  Excluir
                </button>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label className="label">Frente</label>
                <input
                  className="input"
                  value={card.front_text}
                  onChange={(e) => handleEditCard(card.id, { front_text: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label className="label">Verso</label>
                <input
                  className="input"
                  value={card.back_text}
                  onChange={(e) => handleEditCard(card.id, { back_text: e.target.value })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Adicionar cartão</h3>
      <CardForm deckId={id!} onCardAdded={load} />
    </div>
  )

  function handleEditCard(cardId: string, updates: { front_text?: string; back_text?: string }) {
    updateCard(cardId, updates).catch(() => setError('Não foi possível salvar o cartão.'))
  }

  async function handleDeleteCard(cardId: string) {
    if (!confirm('Excluir este cartão?')) return
    try {
      await deleteCard(cardId)
      setCards(cards.filter((c) => c.id !== cardId))
    } catch {
      setError('Não foi possível excluir o cartão.')
    }
  }
}

function CardForm({ deckId, onCardAdded }: { deckId: string; onCardAdded: () => void }) {
  const [cardCode, setCardCode] = useState('')
  const [frontText, setFrontText] = useState('')
  const [backText, setBackText] = useState('')
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageUrls, setImageUrls] = useState<{ front?: string; back?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!frontText.trim() || !backText.trim()) {
      setError('Frente e verso são obrigatórios.')
      return
    }
    setSaving(true)
    setError('')
    try {
      let frontPath: string | undefined
      let backPath: string | undefined

      // Get user id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      if (frontImage) {
        frontPath = await uploadImage(frontImage, user.id, 'front')
      }
      if (backImage) {
        backPath = await uploadImage(backImage, user.id, 'back')
      }

      await createCard({
        deck_id: deckId,
        card_code: cardCode.trim() || undefined,
        front_text: frontText.trim(),
        back_text: backText.trim(),
        front_image_path: frontPath,
        back_image_path: backPath,
      })

      setCardCode('')
      setFrontText('')
      setBackText('')
      setFrontImage(null)
      setBackImage(null)
      setImageUrls({})
      onCardAdded()
    } catch (err: any) {
      setError(err.message?.includes('duplicate') ? 'ID do cartão já existe neste baralho.' : 'Não foi possível adicionar o cartão.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card section">
      <h3>Novo cartão</h3>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label className="label">ID do cartão (opcional)</label>
          <input
            className="input"
            value={cardCode}
            onChange={(e) => setCardCode(e.target.value)}
            placeholder="Ex: CARD-001"
          />
        </div>
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label className="label">Frente (pergunta)</label>
        <textarea
          className="input"
          style={{ minHeight: '80px', resize: 'vertical', padding: '0.625rem 0.875rem' }}
          value={frontText}
          onChange={(e) => setFrontText(e.target.value)}
        />
        {frontImage && (
          <div style={{ marginTop: '0.5rem' }}>
            <label className="label">Imagem da frente</label>
            <img src={imageUrls.front || ''} alt="frente" className="flashcard-image" style={{ maxWidth: '200px', display: 'block' }} />
            <input type="file" accept="image/*" className="input" onChange={(e) => setFrontImage(e.target.files?.[0] || null)} style={{ marginTop: '0.25rem' }} />
          </div>
        )}
        {!frontImage && (
          <input type="file" accept="image/*" className="input" onChange={(e) => setFrontImage(e.target.files?.[0] || null)} />
        )}
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label className="label">Verso (resposta)</label>
        <textarea
          className="input"
          style={{ minHeight: '80px', resize: 'vertical', padding: '0.625rem 0.875rem' }}
          value={backText}
          onChange={(e) => setBackText(e.target.value)}
        />
        {backImage && (
          <div style={{ marginTop: '0.5rem' }}>
            <label className="label">Imagem do verso</label>
            <img src={imageUrls.back || ''} alt="verso" className="flashcard-image" style={{ maxWidth: '200px', display: 'block' }} />
            <input type="file" accept="image/*" className="input" onChange={(e) => setBackImage(e.target.files?.[0] || null)} style={{ marginTop: '0.25rem' }} />
          </div>
        )}
        {!backImage && (
          <input type="file" accept="image/*" className="input" onChange={(e) => setBackImage(e.target.files?.[0] || null)} />
        )}
      </div>
      <button className="btn btn-primary" type="submit" disabled={saving} style={{ minHeight: '44px' }}>
        {saving ? 'Adicionando...' : 'Adicionar cartão'}
      </button>
    </form>
  )
}

function ImportCardForm({ deckId, onClose, onImported }: { deckId: string; onClose: () => void; onImported: () => void }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<{ valid: any[]; invalid: any[] } | null>(null)
  const [confirming, setConfirming] = useState(false)

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    const parsed = parseAndValidateImport(input)
    setResult(parsed)
  }

  const handleConfirm = async () => {
    if (!result) return
    setConfirming(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      for (const card of result.valid) {
        await upsertCard({
          deck_id: deckId,
          card_code: card.id,
          front_text: card.question,
          back_text: card.answer,
          front_image_path: null,
          back_image_path: null,
        })
      }
      onClose()
      onImported()
    } catch {
      setConfirming(false)
      throw new Error('Não foi possível importar os cartões.')
    } finally {
      setConfirming(false)
    }
  }

  if (!result) {
    return (
      <form onSubmit={handleParse} className="card section">
        <h3>Importar cartões</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
          Formato: <code>{'[{' + '"id": "CARD-001", "question": "...", "answer": "..."' + '}]'}</code>
        </p>
        <textarea
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Cole o JSON aqui...'
          style={{ minHeight: '120px', fontFamily: 'monospace', fontSize: '0.875rem' }}
        />
        <button type="button" className="btn" onClick={onClose} style={{ marginRight: '0.5rem' }}>
          Cancelar
        </button>
        <button className="btn btn-primary" type="submit">
          Validar
        </button>
      </form>
    )
  }

  const { valid, invalid } = result

  return (
    <div className="card section">
      <h3>Prévia da importação</h3>
      <p>Válidos: <strong>{valid.length}</strong> | Inválidos: <strong>{invalid.length}</strong></p>

      {invalid.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Itens inválidos:</h4>
          <ul style={{ fontSize: '0.875rem', color: 'var(--danger)', listStyle: 'disc', paddingLeft: '1.2rem' }}>
            {invalid.map((err: any) => (
              <li key={err.index}>Item {err.index + 1}: {err.reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={confirming || valid.length === 0}
        >
          {confirming ? 'Importando...' : `Importar ${valid.length} cartão${valid.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}
