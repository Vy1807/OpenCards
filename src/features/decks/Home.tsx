import { useState, useEffect, useMemo } from 'react';
// @ts-expect-error - react-router-dom v7 tipos não exportam esses membros no .d.ts, mas funcionam em tempo de execução.
import { useNavigate } from 'react-router-dom';
import { useDecks } from './useDecks';
import { streak } from '../../shared/lib/streak';
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
    return decks.filter((d) => {
      const matchName = d.name.toLowerCase().includes(s);
      const matchTag = t === '' || t === 'Todos' ? true : d.tag === t;
      return matchName && matchTag;
    });
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
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: tokens.radius.lg,
              background: tokens.colors.err,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '1.25rem',
              fontFamily: tokens.typography.fontBody,
            }}
          >
            +
          </div>
          <span
            style={{
              fontFamily: tokens.typography.fontHeading,
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: '700',
              color: tokens.colors.ink,
            }}
          >
            + Flashcards
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: tokens.radius.full,
              background: tokens.colors.primaryLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.colors.primary,
              fontWeight: '700',
            }}
          >
            J
          </div>
        </div>
      </header>

      {/* Secao de boas-vindas */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '100%',
            height: '34px',
            marginBottom: '0.75rem',
            overflow: 'hidden',
          }}
        >
          <svg width="100%" height="34" viewBox="0 0 700 40" preserveAspectRatio="none">
            <path
              d="M0,20 Q100,0 200,20 T400,20 T600,20 T700,20"
              stroke={tokens.colors.primary}
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
            color: tokens.colors.ink,
            margin: '0 0 0.75rem 0',
          }}
        >
          Bem-vinda de volta
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginTop: '0.5rem',
          }}
        >
          <span
            style={{
              fontFamily: tokens.typography.fontBody,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.muted,
            }}
          >
            {currentStreak} dias
            <span
              style={{
                color: tokens.colors.primary,
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
                  color: tokens.colors.primary,
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
          gap: '0.5rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
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
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
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
                  gap: '0.375rem',
                  borderRadius: tokens.radius.full,
                  border: `1px solid`,
                  padding: '0.25rem 0.75rem',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  fontFamily: tokens.typography.fontBody,
                  background: active ? tokens.colors.primary : 'transparent',
                  color: active ? tokens.colors.inkInverse : tokens.colors.muted,
                  borderColor: active ? tokens.colors.primary : tokens.colors.line,
                  cursor: 'pointer',
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
          margin: '0 0 1rem 0',
        }}
      >
        Baralhos
      </h2>

      {formError && <p style={{ color: tokens.colors.err, marginBottom: '1rem' }}>{formError}</p>}

      {/* Formulario Novo baralho */}
      <form onSubmit={handleCreate} className="card section" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 0.75rem 0', fontSize: tokens.typography.fontSize.lg }}>
          Novo baralho
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PlusIcon size={16} /> {creating ? 'Criando…' : 'Criar baralho'}
          </button>
        </div>
      </form>

      {/* Grade de baralhos */}
      {filteredDecks.length === 0 ? (
        <div className="empty-state">
          <InfoIcon size={32} style={{ marginBottom: '0.75rem', display: 'block' }} />
          <h3>Nenhum baralho encontrado</h3>
          <p>Crie o seu primeiro baralho acima.</p>
        </div>
      ) : (
        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
            listStyle: 'none',
            padding: 0,
          }}
        >
          {filteredDecks.map((deck) => {
            const total = deck.cards_count ?? 0;
            const progress = total > 0 ? Math.round((0 / total) * 100) : 0;
            return (
              <li key={deck.id} style={{ cursor: 'pointer' }}>
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
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <DeckIcon size={20} style={{ flexShrink: 0 }} />
                      <h3
                        style={{
                          margin: 0,
                          fontFamily: tokens.typography.fontHeading,
                          fontSize: tokens.typography.fontSize.lg,
                          color: tokens.colors.ink,
                        }}
                      >
                        {deck.name}
                      </h3>
                    </div>
                    {deck.tag && (
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.primary,
                          background: tokens.colors.primaryLight,
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
                    style={{ marginTop: '0.75rem' }}
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
                        color: tokens.colors.muted,
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
