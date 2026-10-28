import { useState, useEffect, useCallback } from 'react'
// @ts-ignore - react-router-dom v7 exports changed but runtime works
import { useParams, useNavigate } from 'react-router-dom'
import { shuffle } from '../lib/shuffle'
import { getCards, answerCard, type Card } from '../lib/api'
import { isDue } from '../lib/schedule'
import Flashcard from '../components/Flashcard'
import Confetti from '../components/Confetti'
import { CheckIcon, CloseIcon, ArrowRightIcon, ArrowLeftIcon } from '../icons'

type Params = { id: string }

type ReviewCard = Card & {
  box?: number
  due_at?: string
  review_count?: number
}

type Mode = 'due' | 'all' | 'missed'

const MODE_LABELS: Record<Mode, string> = {
  due: 'Pendentes hoje',
  all: 'Todos',
  missed: 'Só os que errei',
}

export default function Review() {
  const navigate = useNavigate()
  const { id } = useParams<Params>()
  const [cards, setCards] = useState<ReviewCard[]>([])
  const [mode, setMode] = useState<Mode>('due')
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [answering, setAnswering] = useState(false)
  const [slideDir, setSlideDir] = useState<'none' | 'correct' | 'wrong'>('none')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getCards(id)
      const reviewCards = data as unknown as ReviewCard[]
      if (reviewCards.length === 0) {
        setCards([])
        setLoading(false)
        return
      }
      let filtered = reviewCards
      const now = new Date()
      if (mode === 'due') {
        filtered = reviewCards.filter((c) => isDue(c.due_at ?? now.toISOString(), now))
      } else if (mode === 'missed') {
        filtered = reviewCards.filter((c) => (c.box ?? 0) === 0)
      }
      const shuffled = shuffle(filtered)
      setCards(shuffled)
      setIndex(0)
      setFlipped(false)
      setCorrect(0)
      setWrong(0)
      setFinished(false)
      setSlideDir('none')
    } catch {
      // erro
    } finally {
      setLoading(false)
    }
  }, [id, mode])

  useEffect(() => {
    load()
  }, [load, id, mode])

  const handleFlip = () => setFlipped((f) => !f)

  const handleAnswer = async (isCorrect: boolean) => {
    if (answering || index >= cards.length) return
    setAnswering(true)
    const card = cards[index]

    if (isCorrect) setCorrect((c) => c + 1)
    else setWrong((w) => w + 1)

    setSlideDir(isCorrect ? 'correct' : 'wrong')

    await new Promise((r) => setTimeout(r, 400))

    try {
      await answerCard(card.id, isCorrect)
    } catch {
      // erro ao salvar, continua mesmo assim
    }

    setFlipped(false)
    setSlideDir('none')
    setAnswering(false)

    if (index + 1 >= cards.length) {
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
    }
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (finished || answering || !cards.length) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleAnswer(true)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleAnswer(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [cards.length, finished, answering, mode, handleAnswer])

  const handleRestart = () => {
    load()
  }

  const handleReviewWrong = () => {
    const wrongCards = cards.filter((c) => (c.box ?? 0) === 0)
    if (wrongCards.length === 0) return
    setCards(shuffle(wrongCards))
    setIndex(0)
    setFlipped(false)
    setCorrect(0)
    setWrong(0)
    setFinished(false)
    setSlideDir('none')
  }

  if (loading) return <div className="page loading-state"><h3>Carregando revisão…</h3></div>
  if (cards.length === 0) {
    return (
      <div className="page empty-state">
        <h1>Sem cartões para revisar</h1>
        <p>Não há cartões neste modo de revisão.</p>
        <button className="btn btn-primary" onClick={() => navigate(`/decks/${id}`)}>Voltar ao baralho</button>
      </div>
    )
  }

  const card = cards[index]
  const total = cards.length
  const done = correct + wrong
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  const modeEntries: [Mode, string][] = Object.entries(MODE_LABELS) as [Mode, string][]

  if (finished) {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0
    const ringDeg = pct * 3.6
    const confetti = pct >= 80
    return (
      <div className="page">
        <h1>Revisão concluída!</h1>
        <div className="card section" style={{ textAlign: 'center' }}>
          <div className="ring" style={{ transform: `rotate(${-45 + ringDeg}deg)` }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--ink)' }}>{correct}/{total}</span>
          </div>
          <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            <CheckIcon size={20} title="Acertos" /> Acertos: <strong>{correct}</strong>
          </p>
          <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            <CloseIcon size={20} title="Erros" /> Erros: <strong>{wrong}</strong>
          </p>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Aproveitamento: <strong>{pct}%</strong>
          </p>
          {confetti && <Confetti />}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={handleReviewWrong} disabled={wrong === 0}>
              {wrong > 0 ? `Revisar erros (${wrong})` : 'Revisar erros'}
            </button>
            <button className="btn" onClick={handleRestart}>Revisar de novo</button>
          </div>
          <button className="btn" onClick={() => navigate(`/decks/${id}`)} style={{ marginTop: '0.5rem' }}>
            Voltar ao baralho
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header style={{ marginBottom: '1rem' }}>
        <h1>Revisão</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '0.75rem' }}>
          Cartão {index + 1} de {total}
        </p>
        <div className="ecg-progress">
          <div className="ecg-progress__fill" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Modo de revisão</label>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {modeEntries.map(([m, label]) => (
            <button
              key={m}
              className={`btn ${mode === m ? 'btn-primary' : ''}`}
              onClick={() => setMode(m)}
              style={{
                minHeight: 'auto',
                padding: '0.4rem 0.8rem',
                fontSize: '0.875rem',
                background: mode === m ? 'var(--rose-500)' : 'var(--surface)',
                color: mode === m ? '#ffffff' : 'var(--ink)',
                borderColor: mode === m ? 'var(--rose-500)' : 'var(--line)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flashcard-flipper" style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <div
          style={{
            transform: slideDir === 'correct' ? 'translateX(120px) rotate(8deg)' : slideDir === 'wrong' ? 'translateX(-120px) rotate(-8deg)' : 'none',
            opacity: slideDir === 'none' ? 1 : 0,
            transition: slideDir === 'none' ? 'none' : 'transform 0.4s ease, opacity 0.4s ease',
          }}
        >
          <Flashcard
            card={card as unknown as { id: string; card_code: string; front_text: string; back_text: string; front_image_path: string | null; back_image_path: string | null }}
            flipped={flipped}
            onFlip={handleFlip}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
        <button
          className="btn btn-primary"
          onClick={() => handleAnswer(true)}
          disabled={answering || flipped}
          style={{ flex: 1, minHeight: '56px', fontSize: '1.1rem' }}
        >
          <ArrowRightIcon size={16} /> <CheckIcon size={16} /> Acertei
        </button>
        <button
          className="btn btn-danger"
          onClick={() => handleAnswer(false)}
          disabled={answering || flipped}
          style={{ flex: 1, minHeight: '56px', fontSize: '1.1rem' }}
        >
          <ArrowLeftIcon size={16} /> <CloseIcon size={16} /> Errei
        </button>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button
          className="btn"
          onClick={handleFlip}
          disabled={answering}
          style={{ minHeight: '44px' }}
        >
          {flipped ? 'Esconder resposta' : 'Mostrar resposta'}
        </button>
      </div>
      <p style={{ marginTop: '0.5rem', color: 'var(--muted)', fontSize: '0.875rem', textAlign: 'center' }}>
        Espaço/Enter: virar <ArrowRightIcon size={14} style={{ margin: '0 0.25rem' }} /> acertei <ArrowLeftIcon size={14} style={{ margin: '0 0.25rem' }} /> errei
      </p>
    </div>
  )
}
