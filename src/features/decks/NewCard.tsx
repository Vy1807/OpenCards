import { useCallback, useEffect, useRef, useState } from 'react';

import { useCards } from '../../app/providers';
import type { Deck, NewCardInput } from '../../entities/card/model/card';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { UploadIcon } from '../../shared/ui/icons';
import { tokens } from '../../design/tokens';

export type NewCardMode = 'manual' | 'import';

export interface NewCardProps {
  /** Baralhos disponíveis para o select de destino. */
  decks: Deck[];
  /** Chamado ao salvar; recebe os dados do novo cartão. */
  onSave: (input: NewCardInput) => Promise<void>;
  /** Quando true desabilita o botão de salvar (p. ex. durante carregamento). */
  creating?: boolean;
}

/**
 * Tela "Novo card" com layout bi-partido.
 *
 * Coluna esquerda: formulário (select de baralho, frente e verso, botões
 * "Anexar imagem" e barra de ações). Coluna direita: pré-visualização reativa
 * que atualiza em tempo real à medida que o usuário digita, com o verso
 * renderizado espelhado via `transform: scaleX(-1)`.
 */
function NewCard({ decks, onSave, creating = false }: NewCardProps) {
  const [mode, setMode] = useState<NewCardMode>('manual');
  const [deckId, setDeckId] = useState<string>('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);

  const revoke = useCallback(
    (kind: 'front' | 'back') => {
      const url = kind === 'front' ? frontUrl : backUrl;
      if (url) {
        URL.revokeObjectURL(url);
        if (kind === 'front') {
          setFrontUrl(null);
        } else {
          setBackUrl(null);
        }
      }
    },
    [frontUrl, backUrl]
  );

  useEffect(() => {
    return () => {
      if (frontUrl) URL.revokeObjectURL(frontUrl);
      if (backUrl) URL.revokeObjectURL(backUrl);
    };
  }, [frontUrl, backUrl]);

  const pickFile = useCallback((kind: 'front' | 'back') => {
    if (kind === 'front') {
      frontFileRef.current?.click();
    } else {
      backFileRef.current?.click();
    }
  }, []);

  const handleImage = useCallback(
    (kind: 'front' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      const url = file ? URL.createObjectURL(file) : null;
      const prev = kind === 'front' ? frontUrl : backUrl;
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      if (kind === 'front') {
        setFrontUrl(url);
      } else {
        setBackUrl(url);
      }
    },
    [frontUrl, backUrl]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!deckId || !front.trim() || !back.trim()) {
        setError('Preencha o baralho, a frente e o verso.');
        return;
      }
      setSaving(true);
      try {
        await onSave({
          deck_id: deckId,
          card_code: undefined,
          front_text: front.trim(),
          back_text: back.trim(),
          front_image_path: null,
          back_image_path: null,
        });
        setDeckId('');
        setFront('');
        setBack('');
        revoke('front');
        revoke('back');
      } catch {
        setError('Não foi possível salvar o card.');
      } finally {
        setSaving(false);
      }
    },
    [deckId, front, back, onSave, revoke]
  );

  const handleCancel = useCallback(() => {
    setError('');
    setDeckId('');
    setFront('');
    setBack('');
    revoke('front');
    revoke('back');
  }, [revoke]);

  const toggleStyle = (active: boolean) => ({
    background: active ? tokens.colors.primary : 'transparent',
    color: active ? tokens.colors.inkInverse : tokens.colors.muted,
    border: 'none',
    padding: '0.5rem 1rem',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    fontFamily: tokens.typography.fontBody,
    cursor: 'pointer',
    flex: 1,
  });

  const imageButton = (kind: 'front' | 'back') => (
    <button
      type="button"
      onClick={() => pickFile(kind)}
      disabled={creating}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.75rem',
        fontSize: tokens.typography.fontSize.xs,
        borderRadius: tokens.radius.sm,
        border: `1px solid ${tokens.colors.line}`,
        background: tokens.colors.surface,
        color: tokens.colors.ink,
        cursor: creating ? 'not-allowed' : 'pointer',
      }}
    >
      <UploadIcon size={14} style={{ verticalAlign: 'middle' }} /> Anexar imagem
    </button>
  );

  const hasDeck = decks.some((d) => d.id === deckId);
  const canSave = hasDeck && front.trim() !== '' && back.trim() !== '';

  return (
    <div
      className="page"
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: tokens.typography.fontHeading,
            fontSize: tokens.typography.fontSize.xxl,
            margin: 0,
            color: tokens.colors.ink,
          }}
        >
          Novo card
        </h1>
        <p
          style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.muted,
            marginTop: '0.25rem',
          }}
        >
          Crie um cartão de flashcard para o baralho selecionado.
        </p>
      </div>

      {error && (
        <p style={{ color: tokens.colors.err, fontSize: tokens.typography.fontSize.sm }}>{error}</p>
      )}

      {/* Toggle grupo: Criar manualmente vs Importar JSON */}
      <div
        style={{
          display: 'flex',
          border: `1px solid ${tokens.colors.line}`,
          borderRadius: tokens.radius.md,
          background: tokens.colors.surface,
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'manual'}
          onClick={() => setMode('manual')}
          style={toggleStyle(mode === 'manual')}
        >
          Criar manualmente
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'import'}
          onClick={() => setMode('import')}
          style={toggleStyle(mode === 'import')}
        >
          Importar JSON
        </button>
      </div>

      {mode === 'manual' ? (
        <form
          id="new-card-form"
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '260px' }}>
            <Select
              label="Baralho de destino"
              options={decks.map((d) => ({ value: d.id, label: d.name }))}
              value={deckId}
              onChange={setDeckId}
              disabled={creating}
            />
          </div>
          <div
            style={{
              flex: 1,
              minWidth: '260px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Input
              label="Frente · pergunta"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Digite a pergunta"
              disabled={creating}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {imageButton('front')}
              <input
                type="file"
                accept="image/*"
                ref={frontFileRef}
                style={{ display: 'none' }}
                onChange={handleImage('front')}
              />
              {frontUrl && (
                <img
                  src={frontUrl}
                  alt="prévia frente"
                  style={{
                    maxWidth: '120px',
                    maxHeight: '120px',
                    borderRadius: tokens.radius.sm,
                    marginLeft: '0.5rem',
                  }}
                />
              )}
            </div>
            <Input
              label="Verso · resposta"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Digite a resposta"
              disabled={creating}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {imageButton('back')}
              <input
                type="file"
                accept="image/*"
                ref={backFileRef}
                style={{ display: 'none' }}
                onChange={handleImage('back')}
              />
              {backUrl && (
                <img
                  src={backUrl}
                  alt="prévia verso"
                  style={{
                    maxWidth: '120px',
                    maxHeight: '120px',
                    borderRadius: tokens.radius.sm,
                    marginLeft: '0.5rem',
                  }}
                />
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="solid"
              onClick={handleSubmit}
              disabled={creating || saving || !canSave}
            >
              {saving ? 'Salvando…' : 'Salvar card'}
            </Button>
            <Button
              variant="outline"
              onClick={handleSubmit}
              disabled={creating || saving || !canSave}
            >
              Salvar e criar outro
            </Button>
            <Button variant="ghost" onClick={handleCancel} disabled={creating || saving}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Card
          bordered
          shadowed
          style={{
            border: `1px dashed ${tokens.colors.primaryLightStronger}`,
            background: tokens.colors.primaryLight,
            padding: tokens.spacing[8],
          }}
        >
          <textarea
            placeholder='[{ "id": "CARD-001", "question": "...", "answer": "..." }]'
            style={{
              width: '100%',
              minHeight: '160px',
              fontFamily: 'monospace',
              fontSize: tokens.typography.fontSize.sm,
              padding: '0.75rem',
              borderRadius: tokens.radius.sm,
              border: `1px solid ${tokens.colors.line}`,
              background: tokens.colors.surface,
              color: tokens.colors.ink,
              resize: 'vertical',
            }}
          />
          <Button variant="solid" disabled style={{ marginTop: '0.75rem', width: 'fit-content' }}>
            Importar cards
          </Button>
        </Card>
      )}

      {/* Pré-visualização reativa (coluna direita do layout bi-partido) */}
      <Card
        padded="lg"
        shadowed
        style={{
          background: tokens.colors.primaryLight,
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        data-testid="card-preview"
      >
        <div
          style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.muted,
            textAlign: 'center',
          }}
        >
          #{deckId ? 'selecionado' : '—'} · Frente
        </div>
        <div
          data-testid="preview-front"
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            textAlign: 'center',
            wordBreak: 'break-word',
          }}
        >
          {front || 'Pergunta'}
        </div>
        {frontUrl && (
          <img
            src={frontUrl}
            alt="prévia frente"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              borderRadius: tokens.radius.md,
            }}
          />
        )}
        <div style={{ marginTop: 'auto' }}>
          {/* Verso espelhado: simula o lado de trás do cartão visto contra a luz. */}
          <div style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>
            <div
              data-testid="preview-back"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                wordBreak: 'break-word',
              }}
            >
              {back || 'Resposta'}
            </div>
          </div>
        </div>
        <p
          style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.muted,
          }}
        >
          Clique no card para virar
        </p>
      </Card>
    </div>
  );
}

NewCard.displayName = 'NewCard';

/**
 * Página de rota: conecta o componente ao estado global (useCards) e ao
 * Supabase via createCard. Testes renderizam o `NewCard` diretamente com
 * `decks` e `onSave` props, sem tocar na rede.
 */
export function NewCardPage() {
  const { decks, createCard } = useCards();

  return (
    <NewCard
      decks={decks}
      onSave={async (input: NewCardInput) => {
        const created = await createCard(input);
        if (!created) {
          throw new Error('Não foi possível salvar o cartão.');
        }
      }}
    />
  );
}

export default NewCard;
