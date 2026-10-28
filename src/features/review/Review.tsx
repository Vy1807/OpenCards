import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { shuffle } from '../../shared/lib/shuffle';
import { useDeck } from '../decks/useDeck';
import { isDue, INTERVALS_DAYS } from '../../shared/lib/schedule';
import type { Card } from '../../entities/card/model/card';
import Flashcard from './Flashcard';
import Confetti from './Confetti';
import { CheckIcon, CloseIcon, ArrowRightIcon, ArrowLeftIcon } from '../../shared/ui/icons';
import Header from '../../components/ui/Header';
import ProgressBar from '../../components/ui/ProgressBar';
import { tokens } from '../../design/tokens';

type Params = { id: string };

const INTERVAL_LABELS: Record<number, string> = {
  0: 'Amanhã',
  1: 'Em 1 dia',
  3: 'Em 3 dias',
  7: 'Em 1 semana',
  14: 'Em 2 semanas',
  30: 'Em 1 mês',
};

export default function Review() {
  const navigate = useNavigate();
  const { id } = useParams<Params>();
  const { cards: deckCards, refresh, answerCard } = useDeck(id!);
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const deckCardsRef = useRef(deckCards);
  useEffect(() => {
    deckCardsRef.current = deckCards;
  }, [deckCards]);

  const load = useCallback(async () => {
    if (!id) return;
    setReviewLoading(true);
    try {
      await refresh();
      const now = new Date();
      const filtered = deckCardsRef.current.filter((c) =>
        isDue(c.due_at ?? now.toISOString(), now)
      );
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
  }, [id, refresh]);

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
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate(`/decks/${id}`);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cards.length, finished, answering, handleAnswer, navigate, id]);

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
        <header style={{ marginBottom: tokens.space[6] }}>
          <Header title="Revisão concluída" showBack backTo={`/decks/${id}`} />
        </header>
        <section className="card section" style={{ textAlign: 'center' }}>
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
              gap: tokens.space[3],
              justifyContent: 'center',
              marginBottom: tokens.space[4],
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
              style={{ minHeight: '48px', flex: 1 }}
            >
              {wrong > 0 ? `Revisar erros (${wrong})` : 'Revisar erros'}
            </button>
            <button className="btn" onClick={handleRestart} style={{ minHeight: '48px', flex: 1 }}>
              Revisar de novo
            </button>
          </div>
          <button
            className="btn"
            onClick={() => navigate(`/decks/${id}`)}
            style={{ marginTop: tokens.space[3], minHeight: '44px' }}
          >
            Voltar ao baralho
          </button>
        </section>
      </div>
    );
  }

  // Calcula o próximo intervalo se o usuário acertar este card
  const nextIntervalDays = card.box != null ? INTERVALS_DAYS[Math.min(card.box + 1, 5)] : 1;
  const nextIntervalLabel = INTERVAL_LABELS[nextIntervalDays] ?? 'Em breve';

  return (
    <div className="page">
      {/* Cabeçalho sem sobreposição: título + contador lado a lado */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.space[6],
          gap: tokens.space[4],
        }}
      >
        <Header title="Revisão do dia" showBack backTo={`/decks/${id}`} />
        <span
          style={{
            fontFamily: tokens.typography.fontHeading,
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: '700',
            color: tokens.colors.ink,
            whiteSpace: 'nowrap',
          }}
        >
          {index + 1} de {total}
        </span>
      </header>

      {/* Barra de progresso ECG */}
      <ProgressBar
        value={progress}
        label={`${done} de ${total} respondido`}
        style={{ marginBottom: tokens.space[4] }}
      />

      {/* Contador do card */}
      <p
        style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.muted,
          textAlign: 'center',
          marginBottom: tokens.space[4],
        }}
      >
        Cartão {index + 1} de {total}
      </p>

      {/* Card grande centralizado com altura mínima e scroll interno */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: tokens.space[3],
          marginBottom: tokens.space[6],
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            minHeight: '320px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Flashcard card={card} flipped={flipped} onFlip={handleFlip} />
        </div>
        <p
          style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.muted,
            textAlign: 'center',
          }}
        >
          Vire o card para ver a resposta e avaliar
        </p>
      </div>

      {/* Botões de avaliação com próximo intervalo */}
      <div style={{ width: '100%', maxWidth: '420px', marginBottom: tokens.space[6] }}>
        <div style={{ display: 'flex', gap: tokens.space[3], width: '100%', marginBottom: tokens.space[3] }}>
          <button
            className="btn"
            onClick={() => handleAnswer(false)}
            disabled={answering || !flipped}
            tabIndex={0}
            aria-label="Difícil - Errei"
            style={{
              flex: 1,
              minHeight: '56px',
              fontSize: '1rem',
              background: 'transparent',
              color: tokens.colors.err,
              border: `1px solid ${tokens.colors.err}`,
            }}
          >
            <ArrowLeftIcon size={16} aria-hidden="true" /> Difícil
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleAnswer(true)}
            disabled={answering || !flipped}
            tabIndex={0}
            aria-label="Bom - Acertei"
            style={{ flex: 1, minHeight: '56px', fontSize: '1rem' }}
          >
            Bom <CheckIcon size={16} aria-hidden="true" style={{ verticalAlign: 'middle' }} />
          </button>
          <button
            className="btn"
            onClick={() => handleAnswer(true)}
            disabled={answering || !flipped}
            tabIndex={0}
            aria-label="Fácil - Acertei fácil"
            style={{
              flex: 1,
              minHeight: '56px',
              fontSize: '1rem',
              background: 'transparent',
              color: tokens.colors.ok,
              border: `1px solid ${tokens.colors.ok}`,
            }}
          >
            Fácil <ArrowRightIcon size={16} aria-hidden="true" style={{ verticalAlign: 'middle' }} />
          </button>
        </div>

        {/* Próximo intervalo */}
        <p
          style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.primary,
            fontWeight: '600',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Se acertar: próximo review {nextIntervalLabel}
        </p>
      </div>

      {/* Botão mostrar/esconder resposta */}
      <div style={{ width: '100%', maxWidth: '420px', marginBottom: tokens.space[4] }}>
        <button
          className="btn"
          onClick={handleFlip}
          disabled={answering}
          tabIndex={0}
          aria-label={flipped ? 'Esconder resposta' : 'Mostrar resposta'}
          style={{ width: '100%', minHeight: '44px' }}
        >
          {flipped ? 'Esconder resposta' : 'Mostrar resposta'}
        </button>
      </div>

      {/* Dica de teclado coerente com controles */}
      <p
        style={{
          color: tokens.colors.muted,
          fontSize: tokens.typography.fontSize.xs,
          textAlign: 'center',
          margin: 0,
        }}
      >
        Espaço/Enter: virar{' '}
        <ArrowRightIcon size={14} style={{ margin: '0 0.25rem', verticalAlign: 'middle' }} />{' '}
        acertei{' '}
        <ArrowLeftIcon size={14} style={{ margin: '0 0.25rem', verticalAlign: 'middle' }} /> errei{' '}
        Esc: sair
      </p>
    </div>
  );
}
