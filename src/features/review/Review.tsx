import { useState, useEffect, useCallback } from 'react';
// @ts-expect-error - react-router-dom v7 tipos não exportam esses membros no .d.ts, mas funcionam em tempo de execução.
import { useNavigate, useParams } from 'react-router-dom';
import { shuffle } from '../../shared/lib/shuffle';
import { useDeck } from '../decks/useDeck';
import { isDue } from '../../shared/lib/schedule';
import type { Card } from '../../entities/card/model/card';
import Flashcard from './Flashcard';
import Confetti from './Confetti';
import { CheckIcon, CloseIcon, ArrowRightIcon, ArrowLeftIcon } from '../../shared/ui/icons';
import ProgressBar from '../../components/ui/ProgressBar';
import { tokens } from '../../design/tokens';

type Params = { id: string };

export default function Review() {
  const navigate = useNavigate();
  const { id } = useParams<Params>();
  const { cards: deckCards, refresh, answerCard } = useDeck(id);
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setReviewLoading(true);
    try {
      await refresh();
      const now = new Date();
      const filtered = deckCards.filter((c) => isDue(c.due_at ?? now.toISOString(), now));
      const shuffled = shuffle(filtered);
      setCards(shuffled);
      setIndex(0);
      setFlipped(false);
      setCorrect(0);
      setWrong(0);
      setFinished(false);
    } catch {
      // erro ao carregar — já está no contexto
    } finally {
      setReviewLoading(false);
    }
  }, [id, deckCards, refresh]);

  useEffect(() => {
    load();
  }, [load, id]);

  const handleFlip = () => setFlipped((f) => !f);

  const handleAnswer = useCallback(
    async (isCorrect: boolean) => {
      if (answering || index >= cards.length) return;
      const card = cards[index];

      if (isCorrect) setCorrect((c) => c + 1);
      else setWrong((w) => w + 1);

      await new Promise((r) => setTimeout(r, 400));

      try {
        // aciona scheduleNext (intervalos Leitner 0/1/3/7/14/30) no servidor
        await answerCard(card.id, isCorrect);
      } catch {
        // erro ao salvar, continua mesmo assim
      }

      setFlipped(false);
      setAnswering(false);

      if (index + 1 >= cards.length) {
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [cards, index, answering, answerCard]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (finished || answering || !cards.length) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cards.length, finished, answering, handleAnswer]);

  const handleRestart = () => {
    load();
  };

  const total = cards.length;
  const done = correct + wrong;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  if (reviewLoading)
    return (
      <div className="page loading-state">
        <h3>Carregando revisão…</h3>
      </div>
    );
  if (cards.length === 0) {
    return (
      <div className="page empty-state">
        <h1>Sem cartões para revisar</h1>
        <p>Não há cartões neste modo de revisão.</p>
        <button className="btn btn-primary" onClick={() => navigate(`/decks/${id}`)}>
          Voltar ao baralho
        </button>
      </div>
    );
  }

  const card = cards[index];

  if (finished) {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const ringDeg = pct * 3.6;
    const confetti = pct >= 80;
    return (
      <div className="page">
        <h1>Revisão concluída!</h1>
        <div className="card section" style={{ textAlign: 'center' }}>
          <div className="ring" style={{ transform: `rotate(${-45 + ringDeg}deg)` }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: tokens.colors.ink }}>
              {correct}/{total}
            </span>
          </div>
          <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            <CheckIcon size={20} title="Acertos" /> Acertos: <strong>{correct}</strong>
          </p>
          <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            <CloseIcon size={20} title="Erros" /> Erros: <strong>{wrong}</strong>
          </p>
          <p style={{ color: tokens.colors.muted, marginBottom: '1rem' }}>
            Aproveitamento: <strong>{pct}%</strong>
          </p>
          {confetti && <Confetti />}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <button
              className="btn btn-primary"
              onClick={() => {
                const wrongCards = cards.filter((c) => (c.box ?? 0) === 0);
                if (wrongCards.length === 0) return;
                setCards(shuffle(wrongCards));
                setIndex(0);
                setFlipped(false);
                setCorrect(0);
                setWrong(0);
                setFinished(false);
              }}
              disabled={wrong === 0}
            >
              {wrong > 0 ? `Revisar erros (${wrong})` : 'Revisar erros'}
            </button>
            <button className="btn" onClick={handleRestart}>
              Revisar de novo
            </button>
          </div>
          <button
            className="btn"
            onClick={() => navigate(`/decks/${id}`)}
            style={{ marginTop: '0.5rem' }}
          >
            Voltar ao baralho
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header de foco */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={() => navigate(`/decks/${id}`)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeftIcon size={16} style={{ flexShrink: 0 }} /> ← Baralhos
        </button>
        <h1
          style={{
            fontFamily: tokens.typography.fontHeading,
            fontSize: tokens.typography.fontSize.xxl,
            fontWeight: '700',
            color: tokens.colors.ink,
            margin: 0,
          }}
        >
          Revisão do dia
        </h1>
        <span
          style={{
            fontFamily: tokens.typography.fontBody,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: '600',
            color: tokens.colors.primary,
          }}
        >
          {index + 1} / {total}
        </span>
      </header>

      {/* Barra de progresso ECG (avanca a cada card respondido) */}
      <ProgressBar
        value={progress}
        label={`${done} de ${total} respondido`}
        style={{ marginBottom: '1rem' }}
      />
      <p
        style={{
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.muted,
          textAlign: 'center',
          marginBottom: '1rem',
        }}
      >
        Cartão {index + 1} de {total}
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <Flashcard card={card} flipped={flipped} onFlip={handleFlip} />
        <p
          style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.muted,
          }}
        >
          Vire o card para ver a resposta e avaliar
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginBottom: '1rem' }}>
        <button
          className="btn"
          onClick={() => handleAnswer(false)}
          disabled={answering || flipped}
          style={{
            flex: 1,
            minHeight: '56px',
            fontSize: '1.1rem',
            background: 'transparent',
            color: tokens.colors.err,
            border: `1px solid ${tokens.colors.err}`,
          }}
        >
          <ArrowLeftIcon size={16} /> Difícil
        </button>
        <button
          className="btn btn-primary"
          onClick={() => handleAnswer(true)}
          disabled={answering || flipped}
          style={{ flex: 1, minHeight: '56px', fontSize: '1.1rem' }}
        >
          Bom <CheckIcon size={16} style={{ verticalAlign: 'middle' }} />
        </button>
        <button
          className="btn"
          onClick={() => handleAnswer(true)}
          disabled={answering || flipped}
          style={{
            flex: 1,
            minHeight: '56px',
            fontSize: '1.1rem',
            background: 'transparent',
            color: tokens.colors.ok,
            border: `1px solid ${tokens.colors.ok}`,
          }}
        >
          Fácil <ArrowRightIcon size={16} style={{ verticalAlign: 'middle' }} />
        </button>
      </div>

      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
        }}
      >
        <button
          className="btn"
          onClick={handleFlip}
          disabled={answering}
          style={{ minHeight: '44px' }}
        >
          {flipped ? 'Esconder resposta' : 'Mostrar resposta'}
        </button>
      </div>
      <p
        style={{
          marginTop: '0.5rem',
          color: tokens.colors.muted,
          fontSize: '0.875rem',
          textAlign: 'center',
        }}
      >
        Espaço/Enter: virar <ArrowRightIcon size={14} style={{ margin: '0 0.25rem' }} />
        acertei <ArrowLeftIcon size={14} style={{ margin: '0 0.25rem' }} />
        errei
      </p>
    </div>
  );
}
