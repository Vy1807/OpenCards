import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecks } from './useDecks';
import { streak, formatStreak } from '../../shared/lib/streak';
import StatusPill from '../../components/ui/StatusPill';
import ProgressBar from '../../components/ui/ProgressBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  DeckIcon,
  PlusIcon,
  SearchIcon,
  AlertIcon,
  RefreshIcon,
  InfoIcon,
} from '../../shared/ui/icons';
import { tokens } from '../../design/tokens';

export default function Home() {
  const navigate = useNavigate();
  const { decks, loading, error, fetchDecks, createDeck, clearError } = useDecks();
  const [creating, setCreating] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const allTags = useMemo(
    () => [...new Set(decks.map((d) => d.tag).filter(Boolean))] as string[],
    [decks]
  );
  const pills = ['Todos', ...allTags];

  const filteredDecks = useMemo(() => {
    const s = search.toLowerCase();
    const t = filterTag;
    return decks
      .filter((d) => {
        const matchName = d.name.toLowerCase().includes(s);
        const matchTag = t === '' || t === 'Todos' ? true : d.tag === t;
        return matchName && matchTag;
      })
      // Revisar agora → prioriza baralho com mais cards pendentes (cards_count como proxy)
      .sort((a, b) => (b.cards_count ?? 0) - (a.cards_count ?? 0));
  }, [decks, search, filterTag]);

  const currentStreak = streak([], new Date());
  const totalCards = filteredDecks.reduce((acc, d) => acc + (d.cards_count ?? 0), 0);
  const firstDeckId = filteredDecks[0]?.id;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Nome do baralho é obrigatório.');
      return;
    }
    setCreating(true);
    setFormError('');
    try {
      const created = await createDeck(name.trim(), tag.trim() || null);
      if (!created) return;
      setName('');
      setTag('');
      if (created.id) navigate(`/decks/${created.id}`);
    } catch {
      setFormError('Não foi possível criar o baralho.');
    } finally {
      setCreating(false);
    }
  };

  if (loading)
    return (
      <div className="page loading-state">
        <h3>Carregando seus baralhos…</h3>
      </div>
    );

  if (error) {
    return (
      <div className="page error-state">
        <AlertIcon size={32} style={{ marginBottom: '0.75rem', display: 'block' }} />
        <h3>Erro ao carregar</h3>
        <p>{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => {
            clearError();
            fetchDecks();
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshIcon size={16} /> Tentar de novo
        </button>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      {/* Ação: criar novo baralho */}
      <div style={{ display: 'flex', gap: tokens.space[2], marginBottom: tokens.space[4] }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setOpenCreate(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            minHeight: '44px',
          }}
        >
          <PlusIcon size={16} style={{ verticalAlign: 'middle' }} />
          {openCreate ? 'Cancelar' : '+ Novo baralho'}
        </button>
      </div>

      {/* Formulário colapsado — visível apenas quando openCreate é true */}
      {openCreate && (
        <form onSubmit={handleCreate} className="card section" style={{ marginBottom: tokens.space[6] }}>
          <h2 style={{ margin: '0 0 0.75rem 0', fontSize: tokens.typography.fontSize.lg }}>
            Novo baralho
          </h2>
          <div style={{ display: 'flex', gap: tokens.space[3], flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label className="label">Nome</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cardiologia"
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label className="label">Tag (opcional)</label>
              <input
                className="input"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Ex: Anatomia"
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={creating}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', minHeight: '44px' }}
            >
              <PlusIcon size={16} /> {creating ? 'Criando…' : 'Criar baralho'}
            </button>
          </div>
        </form>
      )}

      {formError && <p style={{ color: 'var(--err)', marginBottom: tokens.space[4] }}>{formError}</p>}

      {/* Saudação + resumo + "Revisar agora" em bloco de destaque */}
      <section className="card section" style={{ marginBottom: tokens.space[6], padding: tokens.space[6] }}>
        <div style={{ marginBottom: tokens.space[3] }}>
          <svg
            width="100%"
            height="24"
            viewBox="0 0 700 40"
            preserveAspectRatio="none"
            style={{ display: 'block' }}
          >
            <path
              d="M0,20 Q100,0 200,20 T400,20 T600,20 T700,20"
              stroke="var(--color-primary)"
              strokeWidth="3"
              fill="none"
            />
          </svg>
        </div>
        <h1
          style={{
            fontFamily: tokens.typography.fontHeading,
            fontSize: tokens.typography.fontSize.xxl,
            fontWeight: '700',
            color: 'var(--ink)',
            margin: '0 0 0.75rem 0',
          }}
        >
          Bem-vinda de volta
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.space[4],
            flexWrap: 'wrap',
            marginTop: '0.5rem',
          }}
        >
          <span
            style={{
              fontFamily: tokens.typography.fontBody,
              fontSize: tokens.typography.fontSize.sm,
              color: 'var(--muted)',
            }}
          >
            {formatStreak(currentStreak)}
            <span
              style={{
                color: 'var(--color-primary)',
                fontWeight: '600',
              }}
            >
              desde sua última revisão
            </span>
          </span>
          {totalCards > 0 && (
            <>
              <Button
                variant="solid"
                onClick={() => {
                  if (firstDeckId) navigate(`/decks/${firstDeckId}/review`);
                }}
                disabled={!firstDeckId}
              >
                Revisar agora →
              </Button>
              <span
                style={{
                  fontFamily: tokens.typography.fontBody,
                  fontSize: tokens.typography.fontSize.sm,
                  color: 'var(--color-primary)',
                  fontWeight: '600',
                }}
              >
                {totalCards} card{totalCards !== 1 ? 's' : ''} esperando por você hoje
              </span>
            </>
          )}
        </div>
      </section>

      {/* Barra de busca e filtros em pill */}
      <div
        style={{
          display: 'flex',
          gap: tokens.space[3],
          marginBottom: tokens.space[4],
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.space[2],
            minWidth: '260px',
          }}
        >
          <SearchIcon size={18} style={{ flexShrink: 0 }} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquise por tema…"
            fullWidth
          />
        </div>
        <div style={{ display: 'flex', gap: tokens.space[2], flexWrap: 'wrap' }}>
          {pills.map((p) => {
            const active = filterTag === p || (p === 'Todos' && filterTag === '');
            return (
              <button
                key={p}
                type="button"
                onClick={() => setFilterTag(p === 'Todos' ? '' : p)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.space[2],
                  borderRadius: tokens.radius.full,
                  border: '1px solid',
                  padding: '0.25rem 0.75rem',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  fontFamily: tokens.typography.fontBody,
                  background: active ? tokens.colors.primary : 'transparent',
                  color: active ? tokens.colors.inkInverse : tokens.colors.muted,
                  borderColor: active ? tokens.colors.primary : tokens.colors.line,
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <h2
        style={{
          fontFamily: tokens.typography.fontHeading,
          fontSize: tokens.typography.fontSize.xl,
          color: tokens.colors.ink,
          margin: `0 0 ${tokens.space[4]} 0`,
        }}
      >
        Baralhos
      </h2>

      {/* Grade de baralhos */}
      {filteredDecks.length === 0 ? (
        <div className="empty-state" style={{ padding: `${tokens.space[8]} ${tokens.space[4]}` }}>
          <InfoIcon size={32} style={{ marginBottom: '0.75rem', display: 'block' }} />
          <h3>Nenhum baralho encontrado</h3>
          <p>Crie o seu primeiro baralho acima.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setOpenCreate(true)}
            style={{ marginTop: tokens.space[4], minHeight: '44px' }}
          >
            <PlusIcon size={16} style={{ verticalAlign: 'middle' }} />
            Criar primeiro baralho
          </button>
        </div>
      ) : (
        <ul
          className="home-decks-grid"
          style={{
            listStyle: 'none',
            padding: 0,
          }}
        >
          {filteredDecks.map((deck) => {
            const total = deck.cards_count ?? 0;
            const progress = total > 0 ? Math.round((0 / total) * 100) : 0;
            return (
              <li
                key={deck.id}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/decks/${deck.id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/decks/${deck.id}`);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Abrir baralho ${deck.name}`}
              >
                <Card
                  padded="lg"
                  shadowed
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: tokens.space[3],
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.space[2],
                      }}
                    >
                      <DeckIcon size={20} style={{ flexShrink: 0 }} />
                      <h3
                        style={{
                          margin: 0,
                          fontFamily: tokens.typography.fontHeading,
                          fontSize: tokens.typography.fontSize.lg,
                          color: 'var(--ink)',
                        }}
                      >
                        {deck.name}
                      </h3>
                    </div>
                    {deck.tag && (
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
                  </div>
                  <span
                    className="badge badge-neutral"
                    style={{ fontSize: tokens.typography.fontSize.sm }}
                  >
                    {`${total} cartão${total !== 1 ? 's' : ''}`}
                  </span>
                  <ProgressBar
                    value={progress}
                    label={`${progress}% dominado`}
                    style={{ marginTop: tokens.space[3] }}
                  />
                  <div
                    style={{
                      marginTop: 'auto',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <StatusPill variant={total === 0 ? 'uptodate' : 'due'} count={total} />
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: 'var(--muted)',
                      }}
                    >
                      Clique para abrir
                    </span>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
