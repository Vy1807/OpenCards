import { useCallback, useEffect, useRef, useState } from 'react';

import { useCards } from '../../app/providers';
import type { Deck, NewCardInput } from '../../entities/card/model/card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { tokens } from '../../design/tokens';
import { useNavigate, useSearchParams } from 'react-router-dom';

export type NewCardMode = 'manual' | 'import';

export interface NewCardProps {
  decks: Deck[];
  onSave: (input: NewCardInput) => Promise<void>;
  creating?: boolean;
  defaultDeckId?: string;
}

/**
 * Tela "Novo card" — formulário centralizado com largura máxima 720px.
 *
 * Pergunta e Resposta em textarea com altura que cresce + contador de caracteres.
 * Prévia do card no tema atual com alternância Frente/Verso (não ambas ao mesmo tempo).
 * Botões: Salvar card (primário), Salvar e criar outro (secundário), Cancelar (texto).
 * O botão primário só fica habilitado quando Pergunta e Resposta estão preenchidas.
 */
function NewCard({ decks, onSave, creating = false, defaultDeckId }: NewCardProps) {
  const [deckId, setDeckId] = useState<string>(defaultDeckId || '');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showFront, setShowFront] = useState(true);

  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);

  const revoke = useCallback(
    (kind: 'front' | 'back') => {
      const url = kind === 'front' ? frontUrl : backUrl;
      if (url) {
        URL.revokeObjectURL(url);
        if (kind === 'front') setFrontUrl(null);
        else setBackUrl(null);
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
    if (kind === 'front') frontFileRef.current?.click();
    else backFileRef.current?.click();
  }, []);

  const handleImage = useCallback(
    (kind: 'front' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      const url = file ? URL.createObjectURL(file) : null;
      const prev = kind === 'front' ? frontUrl : backUrl;
      if (prev) URL.revokeObjectURL(prev);
      if (kind === 'front') setFrontUrl(url);
      else setBackUrl(url);
    },
    [frontUrl, backUrl]
  );

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!front.trim() || !back.trim()) {
        setError('Preencha a pergunta e a resposta.');
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

  const canSave = front.trim() !== '' && back.trim() !== '';

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
      <svg
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        style={{ verticalAlign: 'middle' }}
      >
        <polyline points="16 3 12 7 8 3" />
        <line x1="12" x2="12" y1="7" y2="21" />
        <polyline points="22 18 18 18 18 22" />
      </svg>
      Anexar imagem
    </button>
  );

  return (
    <div className="page" style={{ maxWidth: '720px', margin: '0 auto', padding: tokens.space[4] }}>
      {error && (
        <p style={{            color: 'var(--err)', fontSize: tokens.typography.fontSize.sm }}>
          {error}
        </p>
      )}

      {/* Pergunta e Resposta — textarea com altura que cresce + contador */}
      <section className="card section" style={{ marginBottom: tokens.space[6] }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <Select
            options={decks.map((d) => ({ value: d.id, label: d.name }))}
            value={deckId}
            onChange={setDeckId}
            label="Baralho de destino"
            disabled={creating}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.space[3] }}>
          <textarea
            ref={frontRef}
            value={front}
            onChange={(e) => {
              setFront(e.target.value);
              autoResize(e.target);
            }}
            placeholder="Digite a pergunta"
            disabled={creating}
            style={{
              width: '100%',
              minHeight: '96px',
              fontFamily: tokens.typography.fontBody,
              fontSize: tokens.typography.fontSize.base,
              padding: `${tokens.space[3]} ${tokens.space[4]}`,
              borderRadius: tokens.radius.sm,
              border: `1px solid var(--line)`,
              background: 'var(--surface)',
              color: 'var(--ink)',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.space[2] }}>
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
                  marginLeft: tokens.space[2],
                }}
              />
            )}
            <span
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: 'var(--muted)',
              }}
            >
              {front.length} caracteres
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.space[3] }}>
          <textarea
            ref={backRef}
            value={back}
            onChange={(e) => {
              setBack(e.target.value);
              autoResize(e.target);
            }}
            placeholder="Digite a resposta"
            disabled={creating}
            style={{
              width: '100%',
              minHeight: '96px',
              fontFamily: tokens.typography.fontBody,
              fontSize: tokens.typography.fontSize.base,
              padding: `${tokens.space[3]} ${tokens.space[4]}`,
              borderRadius: tokens.radius.sm,
              border: `1px solid var(--line)`,
              background: 'var(--surface)',
              color: 'var(--ink)',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.space[2] }}>
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
                  marginLeft: tokens.space[2],
                }}
              />
            )}
            <span
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: 'var(--muted)',
              }}
            >
              {back.length} caracteres
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: tokens.space[3], width: '100%' }}>
          <Button
            variant="solid"
            onClick={handleSubmit}
            disabled={creating || saving || !canSave}
          >
            {saving ? 'Salvando…' : 'Salvar card'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              void handleSubmit({ preventDefault: () => {} } as React.FormEvent).then(() => {
                setFront('');
                setBack('');
              });
            }}
            disabled={creating || saving || !canSave}
          >
            Salvar e criar outro
          </Button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={creating || saving}
            style={{
              background: 'transparent',
              border: 'none',
              color: tokens.colors.muted,
              fontSize: tokens.typography.fontSize.sm,
              cursor: creating || saving ? 'not-allowed' : 'pointer',
              padding: 0,
            }}
          >
            Cancelar
          </button>
        </div>
      </section>

      {/* Pré-visualização do card — Frente/Verso alternados, não ambos ao mesmo tempo */}
      <section className="card section" style={{ marginBottom: tokens.space[6] }}>
        <div
          style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.muted,
            textAlign: 'center',
            marginBottom: tokens.space[2],
          }}
        >
          #{deckId ? 'selecionado' : '—'} · {showFront ? 'Frente' : 'Verso'}
        </div>
        <div
          style={{
            width: '100%',
            maxWidth: '320px',
            minHeight: '220px',
            border: 'var(--border)',
            borderRadius: tokens.radius.lg,
            background: tokens.colors.surface,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.space[3],
            padding: tokens.space[6],
            margin: '0 auto',
          }}
          onClick={() => setShowFront((f) => !f)}
        >
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              textAlign: 'center',
              wordBreak: 'break-word',
            }}
            data-testid="preview-text"
          >
            {showFront ? (front || 'Pergunta') : (back || 'Resposta')}
          </div>
          {(showFront ? frontUrl : backUrl) && (
            <img
              src={(showFront ? frontUrl : backUrl) ?? undefined}
              alt="prévia"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                borderRadius: tokens.radius.md,
              }}
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFront((f) => !f)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-primary)',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: '600',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {showFront ? 'Mostrar resposta' : 'Mostrar pergunta'}
        </button>
      </section>
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultDeckId = searchParams.get('deckId') || '';

  return (
    <NewCard
      decks={decks}
      defaultDeckId={defaultDeckId}
      onSave={async (input: NewCardInput) => {
        const created = await createCard(input);
        if (!created) {
          throw new Error('Não foi possível salvar o cartão.');
        }
        navigate(`/decks/${input.deck_id}`);
      }}
    />
  );
}

export default NewCard;
