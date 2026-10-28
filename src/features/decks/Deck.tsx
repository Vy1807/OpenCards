import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeck } from './useDeck';
import { exportCards } from '../../shared/lib/exportCards';
import {
  AlertIcon,
  DownloadIcon,
  InfoIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '../../shared/ui/icons';
import Header from '../../components/ui/Header';
import { tokens } from '../../design/tokens';

type Params = { id: string };

export default function Deck() {
  const navigate = useNavigate();
  const { id } = useParams<Params>();
  const { deck, cards, loading, refresh, getDeckStats, deleteCard } = useDeck(id!);
  const [stats, setStats] = useState<{
    total: number;
    mastered: number;
    dueToday: number;
    accuracy: number;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deckError, setDeckError] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    try {
      await refresh();
      const s = await getDeckStats(id);
      if (s) {
        setStats({
          total: s.total,
          mastered: s.mastered,
          dueToday: s.dueToday,
          accuracy: s.accuracy,
        });
      }
    } catch {
      // deck not found or error — erros já estão no contexto
    }
  }, [id, refresh, getDeckStats]);
  useEffect(() => {
    load();
  }, [load, id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const exported = exportCards(cards);
      const json = JSON.stringify(exported, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(deck?.name || 'baralho').replace(/\\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // erro de exportação
    } finally {
      setExporting(false);
    }
  };

  if (loading)
    return (
      <div className="page loading-state">
        <h3>Carregando baralho…</h3>
      </div>
    );
  if (!deck)
    return (
      <div className="page error-state">
        <AlertIcon size={32} style={{ marginBottom: '0.75rem', display: 'block' }} />
        <h3>Baralho não encontrado.</h3>
        {deckError && <p>{deckError}</p>}
      </div>
    );

  const hasCards = cards.length > 0;
  const total = stats?.total ?? 0;
  const mastered = stats?.mastered ?? 0;
  const dueToday = stats?.dueToday ?? 0;
  const accuracy = stats?.accuracy ?? 0;
  const progress = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <div className="page">
      <Header title={deck.name} showBack backTo="/" />

      {/* Título e stats do baralho */}
      <section className="card section" style={{ marginBottom: tokens.space[6] }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.space[4],
          }}
        >
          {/* Estatísticas em grid 2x2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.space[3] }}>
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: tokens.colors.primary,
                }}
              >
                {total}
              </span>
              <span style={{ display: 'block', fontSize: '0.875rem', color: tokens.colors.muted }}>
                total
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: tokens.colors.ok,
                }}
              >
                {mastered}
              </span>
              <span style={{ display: 'block', fontSize: '0.875rem', color: tokens.colors.muted }}>
                dominados
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: tokens.colors.err,
                }}
              >
                {dueToday}
              </span>
              <span style={{ display: 'block', fontSize: '0.875rem', color: tokens.colors.muted }}>
                pendentes hoje
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: tokens.colors.ink,
                }}
              >
                {accuracy}%
              </span>
              <span style={{ display: 'block', fontSize: '0.875rem', color: tokens.colors.muted }}>
                taxa de acerto
              </span>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="ecg-progress">
            <div className="ecg-progress__fill" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ fontSize: '0.875rem', color: tokens.colors.muted, textAlign: 'center' }}>
            {mastered} de {total} dominados
          </p>
        </div>
      </section>

      {/* Ações — hierarquia visual */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.space[3] }}>
        {/* Ação primária: Revisar (largura total) */}
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/decks/${id!}/review`)}
          disabled={!hasCards}
          style={{ minHeight: '56px', fontSize: '1.125rem', width: '100%' }}
        >
          {hasCards ? 'Revisar' : 'Sem cartões para revisar'}
        </button>

        {/* Ações secundárias e terciárias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.space[2] }}>
          {/* Secundário: Adicionar cartão */}
          <button
            className="btn"
            onClick={() => navigate(`/novo-card?deckId=${id}`)}
            disabled={!hasCards}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.space[3],
              flex: 1,
              minHeight: '48px',
              padding: `${tokens.space[3]} ${tokens.space[5]}`,
              border: 'var(--border)',
              background: tokens.colors.surface,
              color: tokens.colors.ink,
            }}
          >
            <PlusIcon size={16} style={{ verticalAlign: 'middle' }} />
            Adicionar cartão
          </button>

          {/* Terciários: Editar + Exportar (menu ou lado a lado) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.space[2] }}>
            <button
              className="btn"
              onClick={() => navigate(`/decks/${id}/edit`)}
              style={{
                minHeight: '48px',
                width: '100%',
                padding: `${tokens.space[3]} ${tokens.space[5]}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.space[3],
                border: 'var(--border)',
                background: tokens.colors.surface,
                color: tokens.colors.ink,
              }}
              title="Editar baralho"
            >
              <PencilIcon size={18} style={{ verticalAlign: 'middle' }} />
              Editar
            </button>
            <button
              className="btn"
              onClick={handleExport}
              disabled={exporting || !hasCards}
              style={{
                minHeight: '48px',
                width: '100%',
                padding: `${tokens.space[3]} ${tokens.space[5]}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.space[3],
                border: 'var(--border)',
                background: tokens.colors.surface,
                color: tokens.colors.ink,
              }}
            >
              <DownloadIcon size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              {exporting ? 'Exportando…' : 'Exportar JSON'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de cartões */}
      <h2
        style={{
          fontFamily: tokens.typography.fontHeading,
          fontSize: tokens.typography.fontSize.xl,
          color: tokens.colors.ink,
          margin: `${tokens.space[6]} 0 ${tokens.space[4]} 0`,
        }}
      >
        Cartões ({cards.length})
      </h2>

      {cards.length === 0 ? (
        <div className="empty-state" style={{ padding: `${tokens.space[8]} ${tokens.space[4]}` }}>
          <InfoIcon size={32} style={{ marginBottom: '0.75rem', display: 'block' }} />
          <h3>Nenhum cartão ainda</h3>
          <p>Adicione um na tela de edição.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cards.map((card) => (
            <li key={card.id} className="card section" style={{ marginBottom: tokens.space[4] }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: tokens.space[4],
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ color: tokens.colors.primary }}>#{card.card_code}</strong>
                  <p style={{ marginTop: tokens.space[2], color: tokens.colors.muted }}>
                    {card.front_text}
                  </p>
                  <p
                    style={{
                      marginTop: tokens.space[2],
                      fontSize: '0.875rem',
                      color: tokens.colors.secondary,
                      fontStyle: 'italic',
                    }}
                  >
                    {card.back_text}
                  </p>
                </div>
                <button
                  className="btn btn-danger"
                  style={{
                    padding: `${tokens.space[2]} ${tokens.space[4]}`,
                    fontSize: '0.875rem',
                    minHeight: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.space[2],
                  }}
                  onClick={() =>
                    deleteCard(card.id).catch(() =>
                      setDeckError('Não foi possível excluir o cartão.')
                    )
                  }
                >
                  <TrashIcon size={16} style={{ verticalAlign: 'middle' }} />
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
