import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shuffle } from '../lib/shuffle'
import { getCards } from '../lib/api'
import Flashcard from '../components/Flashcard'

export default function Review() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [cards, setCards] = useState<{
    id: string
    card_code: string
    front_text: string
    back_text: string
    front_image_path: string | null
    back_image_path: string | null
  }[]>([])
  
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getCards(id)
      if (data.length === 0) {
        setLoading(false)
        return
      }
      const shuffled = shuffle(data)
      setCards(shuffled)
      setIndex(0)
      setFlipped(false)
      setCorrect(0)
      setWrong(0)
      setFinished(false)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load, id])

  const handleFlip = () => setFlipped((f) => !f)

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setCorrect((c) => c + 1)
    else setWrong((w) => w + 1)
    setFlipped(false)
    if (index + 1 >= cards.length) {
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
    }
  }

  const handleRestart = () => {
    const newOrder = shuffle(cards)
    setCards(newOrder)
    setIndex(0)
    setFlipped(false)
    setCorrect(0)
    setWrong(0)
    setFinished(false)
  }

  if (loading) return <div className="page">Carregando...</div>
  if (cards.length === 0) return (
    <div className="page">
      <h1>Sem cartões</h1>
      <p>Adicione cartões a este baralho antes de revisar.</p>
      <button className="btn btn-primary" onClick={() => navigate(`/decks/${id}`)}>Voltar ao baralho</button>
    </div>
  )

  const card = cards[index]

  return (
    <div className="page">
      {finished ? (
        <>
          <h1>Revisão concluída!</h1>
          <div className="card">
            <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              ✅ Acertos: <strong>{correct}</strong>
            </p>
            <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              ❌ Erros: <strong>{wrong}</strong>
            </p>
            <button className="btn btn-primary" onClick={handleRestart} style={{ minHeight: '44px' }}>
              Revisar de novo
            </button>
          </div>
          <button className="btn" onClick={() => navigate(`/decks/${id}`)} style={{ marginTop: '1rem' }}>
            Voltar ao baralho
          </button>
        </>
      ) : (
        <>
          <h1>Revisão</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Cartão {index + 1} de {cards.length}
          </p>
          <div className="flashcard-flipper" style={{ marginBottom: '1.5rem' }}>
            <Flashcard
              card={card}
              flipped={flipped}
              onFlip={handleFlip}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => handleAnswer(true)}
              style={{ flex: 1, minHeight: '56px', fontSize: '1.25rem' }}
            >
              ✓ Acertei
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleAnswer(false)}
              style={{ flex: 1, minHeight: '56px', fontSize: '1.25rem' }}
            >
              ✗ Errei
            </button>
          </div>
          <button
            className="btn"
            type="button"
            onClick={() => navigate(`/decks/${id}`)}
            style={{ marginTop: '1rem' }}
          >
            Sair da revisão
          </button>
        </>
      )}
    </div>
  )
}
