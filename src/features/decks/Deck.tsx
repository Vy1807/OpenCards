import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeck } from './useDeck';
import { parseAndValidateImport } from '../../shared/lib/importCards';
import {
  AlertIcon,
  InfoIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
} from '../../shared/ui/icons';
import { tokens } from '../../design/tokens';

type Params = { id: string };

export default function Deck() {
  const navigate = useNavigate();
  const { id } = useParams<Params>();
  const { deck, cards, loading, refresh, getDeckStats, deleteCard, createCard } = useDeck(id!);
  const [stats, setStats] = useState<{
    total: number;
    mastered: number;
    dueToday: number;
    accuracy: number;
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [deckError, setDeckError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImport = async (file: File) => {
    setImporting(true);
    setDeckError('');
    try {
      const text = await file.text();
      const result = parseAndValidateImport(text);
      if (result.invalid.length > 0) {
        setDeckError(
          result.invalid
            .map((e) => `Item ${e.index + 1}: ${e.reason}`)
            .join('\n')
        );
        return;
      }
      for (const card of result.valid) {
        await createCard({
          deck_id: id!,
          card_code: undefined,
          front_text: card.question,
          back_text: card.answer,
          front_image_path: null,
          back_image_path: null,
        });
      }
      setDeckError(
        `Importados ${result.valid.length} cartão${result.valid.length !== 1 ? 's' : ''} com sucesso.`
      );
      await refresh();
    } catch {
      setDeckError('Não foi possível importar o arquivo.');
    } finally {
      setImporting(false);
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
    <div className="page deck-page-layout">
      {/* Título e stats do baralho */}
      <section className="deck-page-sidebar">
        <div className="card section">
          <h2
            style={{
              fontFamily: tokens.typography.fontHeading,
              fontSize: tokens.typography.fontSize.xl,
              color: tokens.colors.ink,
              margin: 0,
            }}
          >
            {deck?.name || 'Baralho'}
          </h2>
          {deck?.tag && (
            <span
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: 'var(--on-primary)',
                background: 'var(--color-primary)',
                borderRadius: tokens.radius.full,
                padding: '0.125rem 0.5rem',
                fontWeight: '600',
              }}
            >
              {deck.tag}
            </span>
          )}
          {/* Estatísticas em grid 2x2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.space[3] }}>
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 'var(--font-secao-size)',
                  fontWeight: '700',
                  color: 'var(--color-primary)',
                }}
              >
                {total}
              </span>
              <span style={{ display: 'block', fontSize: 'var(--font-pequeno-size)', color: tokens.colors.muted }}>
                total
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 'var(--font-secao-size)',
                  fontWeight: '700',
                  color: 'var(--ok)',
                }}
              >
                {mastered}
              </span>
              <span style={{ display: 'block', fontSize: 'var(--font-pequeno-size)', color: tokens.colors.muted }}>
                dominados
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 'var(--font-secao-size)',
                  fontWeight: '700',
                  color: 'var(--err)',
                }}
              >
                {dueToday}
              </span>
              <span style={{ display: 'block', fontSize: 'var(--font-pequeno-size)', color: tokens.colors.muted }}>
                pendentes hoje
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 'var(--font-secao-size)',
                  fontWeight: '700',
                  color: 'var(--ink)',
                }}
              >
                {accuracy}%
              </span>
              <span style={{ display: 'block', fontSize: 'var(--font-pequeno-size)', color: tokens.colors.muted }}>
                taxa de acerto
              </span>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="ecg-progress">
            <div className="ecg-progress__fill" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ fontSize: 'var(--font-pequeno-size)',            color: 'var(--muted)', textAlign: 'center' }}>
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
          style={{ minHeight: '56px', fontSize: 'var(--font-subtitulo-size)', width: '100%' }}
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
              background: 'var(--surface)',
              color: 'var(--ink)',
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
                background: 'var(--surface)',
                color: 'var(--ink)',
              }}
              title="Editar baralho"
            >
              <PencilIcon size={18} style={{ verticalAlign: 'middle' }} />
              Editar
            </button>
            <button
              className="btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing || !hasCards}
              style={{
                minHeight: '48px',
                width: '100%',
                padding: `${tokens.space[3]} ${tokens.space[5]}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.space[3],
                border: 'var(--border)',
                background: 'var(--surface)',
                color: 'var(--ink)',
              }}
            >
              <UploadIcon size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              {importing ? 'Importando…' : 'Importar JSON'}
            </button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
              }}
            />
          </div>
        </div>
      </div>

      {/* Lista de cartões */}
      <main>
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
                      fontSize: 'var(--font-pequeno-size)',
                      color: 'var(--color-secondary)',
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
                    fontSize: 'var(--font-pequeno-size)',
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
      </main>
    </div>
  );
}
