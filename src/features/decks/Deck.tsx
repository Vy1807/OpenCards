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
      a.download = `${(deck?.name || 'baralho').replace(/\s+/g, '_')}.json`;
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
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="card section">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--rose-600)',
                  }}
                >
                  {total}
                </span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  total
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--ok)',
                  }}
                >
                  {mastered}
                </span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  dominados
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--err)',
                  }}
                >
                  {dueToday}
                </span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  pendentes hoje
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--ink)',
                  }}
                >
                  {accuracy}%
                </span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  taxa de acerto
                </span>
              </div>
            </div>
            <div className="ecg-progress">
              <div className="ecg-progress__fill" style={{ width: `${progress}%` }} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', textAlign: 'center' }}>
              {mastered} de {total} dominados
            </p>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/decks/${id!}/review`)}
          disabled={!hasCards}
          style={{ minHeight: '56px', fontSize: '1.1rem', width: '100%' }}
        >
          {hasCards ? 'Revisar' : 'Sem cartões para revisar'}
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <button
            className="btn"
            onClick={() => navigate(`/decks/${id}/edit`)}
            style={{ minHeight: '48px', width: '100%' }}
            title="Editar baralho"
          >
            <PencilIcon size={18} style={{ verticalAlign: 'middle' }} /> Editar
          </button>
          <button
            className="btn"
            onClick={handleExport}
            disabled={exporting || !hasCards}
            style={{ minHeight: '48px', width: '100%' }}
          >
            <DownloadIcon size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            {exporting ? 'Exportando…' : 'Exportar JSON'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn"
            onClick={() => navigate(`/novo-card?deckId=${id}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: 1,
              minHeight: '44px',
            }}
          >
            <PlusIcon size={16} style={{ verticalAlign: 'middle' }} /> Adicionar cartão
          </button>
        </div>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Cartões ({cards.length})</h2>
      {cards.length === 0 ? (
        <div className="empty-state">
          <InfoIcon size={32} style={{ marginBottom: '0.75rem', display: 'block' }} />
          <h3>Nenhum cartão ainda</h3>
          <p>Adicione um na tela de edição.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cards.map((card) => (
            <li key={card.id} className="card section">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>#{card.card_code}</strong>
                  <p style={{ marginTop: '0.25rem', color: 'var(--muted)' }}>{card.front_text}</p>
                </div>
                <button
                  className="btn btn-danger"
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.875rem',
                    minHeight: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onClick={() =>
                    deleteCard(card.id).catch(() =>
                      setDeckError('Não foi possível excluir o cartão.')
                    )
                  }
                >
                  <TrashIcon size={16} style={{ verticalAlign: 'middle' }} /> Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
