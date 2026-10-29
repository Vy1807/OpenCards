import { useCallback, useEffect, useRef, useState } from 'react';

import { useCards } from '../../app/providers';
import type { Deck, NewCardInput } from '../../entities/card/model/card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { tokens } from '../../design/tokens';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseAndValidateImport } from '../../shared/lib/importCards';

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
 * Aba "Criar manualmente": Pergunta e Resposta em textarea com altura que cresce
 * + contador de caracteres. Prévia do card com alternância Frente/Verso
 * (não ambas ao mesmo tempo). Botões: Salvar card (primário), Salvar e criar
 * outro (secundário), Cancelar (texto).
 *
 * Aba "Importar JSON": três formas de fornecer dados — escolher arquivo .json,
 * arrastar e soltar (desktop) ou colar JSON em caixa de texto. Pré-visualização
 * antes de gravar com quantidade de cartões e os 3 primeiros. Botão
 * "Baixar modelo de JSON" com exemplo de 3 cartões.
 *
 * O botão primário só fica habilitado quando Pergunta e Resposta estão preenchidas
 * (modo manual) ou quando há cartões válidos para importar (modo import).
 */
function NewCard({ decks, onSave, creating = false, defaultDeckId }: NewCardProps) {
  const { createCard } = useCards();
  const [deckId, setDeckId] = useState<string>(defaultDeckId || '');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<NewCardMode>('manual');

  /* Estado da importação JSON */
  const [jsonText, setJsonText] = useState('');
  const [importPreview, setImportPreview] = useState<{
    valid: Array<{ id: string; question: string; answer: string }>;
    invalid: Array<{ index: number; item: { id: string; question: string; answer: string } | null; reason: string }>;
    total: number;
  } | null>(null);
  const [importing, setImporting] = useState(false);

  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);
  const jsonFileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

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

  /* ---------- Import JSON helpers ---------- */

  const parseJsonText = useCallback(
    (text: string) => {
      try {
        const result = parseAndValidateImport(text);
        setImportPreview({
          valid: result.valid,
          invalid: result.invalid,
          total: result.valid.length + result.invalid.length,
        });
      } catch {
        setImportPreview(null);
        setError('Não foi possível processar o JSON.');
      }
    },
    []
  );

  const handleJsonFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setJsonText(text);
        parseJsonText(text);
      };
      reader.readAsText(file);
    },
    [parseJsonText]
  );

  const handleJsonTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setJsonText(text);
      if (text.trim()) {
        parseJsonText(text);
      } else {
        setImportPreview(null);
      }
    },
    [parseJsonText]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type === 'application/json') {
        handleJsonFile(file);
      } else {
        setError('Selecione um arquivo .json válido.');
      }
    },
    [handleJsonFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const importValidCards = useCallback(async () => {
    if (!importPreview?.valid.length) return;
    setImporting(true);
    setError('');
    try {
      for (const card of importPreview.valid) {
        await createCard({
          deck_id: deckId,
          card_code: undefined,
          front_text: card.question,
          back_text: card.answer,
          front_image_path: null,
          back_image_path: null,
        });
      }
      setError(
        `Importados ${importPreview.valid.length} cartão${
          importPreview.valid.length !== 1 ? 's' : ''
        } com sucesso.`
      );
      setJsonText('');
      setImportPreview(null);
    } catch {
      setError('Não foi possível importar o arquivo.');
    } finally {
      setImporting(false);
    }
  }, [deckId, importPreview, createCard]);

  const downloadModelJson = useCallback(() => {
    const model = [
      { id: 'CARD-001', question: 'Qual é a capital do Brasil?', answer: 'Brasília' },
      { id: 'CARD-002', question: 'Quem escreveu "Dom Casmurro"?', answer: 'Machado de Assis' },
      { id: 'CARD-003', question: 'Qual é o maior planeta do sistema solar?', answer: 'Júpiter' },
    ];
    const json = JSON.stringify(model, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo-cartoes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="page new-card-layout" style={{ maxWidth: '1000px', margin: '0 auto', padding: tokens.space[4] }}>
      {error && (
        <p style={{ color: 'var(--err)', fontSize: tokens.typography.fontSize.sm }}>
          {error}
        </p>
      )}

      {/* Toggle grupo: Criar manualmente vs Importar JSON */}
      <div
        style={{
          display: 'flex',
          border: `1px solid ${tokens.colors.line}`,
          borderRadius: tokens.radius.md,
          background: tokens.colors.surface,
          width: 'fit-content',
          marginBottom: tokens.space[6],
        }}
      >
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'manual'}
          onClick={() => setMode('manual')}
          style={{
            background: mode === 'manual' ? tokens.colors.primary : 'transparent',
            color: mode === 'manual' ? tokens.colors.inkInverse : tokens.colors.muted,
            border: 'none',
            padding: '0.5rem 1rem',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            fontFamily: tokens.typography.fontBody,
            cursor: 'pointer',
            flex: 1,
          }}
        >
          Criar manualmente
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'import'}
          onClick={() => setMode('import')}
          style={{
            background: mode === 'import' ? tokens.colors.primary : 'transparent',
            color: mode === 'import' ? tokens.colors.inkInverse : tokens.colors.muted,
            border: 'none',
            padding: '0.5rem 1rem',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            fontFamily: tokens.typography.fontBody,
            cursor: 'pointer',
            flex: 1,
          }}
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
            gap: tokens.space[3],
            flexWrap: 'wrap',
          }}
        >
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
        </form>
      ) : (
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.space[4] }}>
            {/* Dropzone */}
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={(e) => e.preventDefault()}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: tokens.space[4],
                padding: `${tokens.space[6]} ${tokens.space[8]}`,
                border: `2px dashed ${tokens.colors.line}`,
                borderRadius: tokens.radius.lg,
                background: tokens.colors.surface,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <svg
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                style={{ color: tokens.colors.muted }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              <p style={{ margin: 0, color: tokens.colors.muted, fontSize: tokens.typography.fontSize.sm }}>
                Arraste um arquivo .json aqui ou clique para selecionar
              </p>
              <button
                type="button"
                onClick={() => jsonFileRef.current?.click()}
                className="btn btn-primary"
                style={{ minHeight: '44px' }}
              >
                Escolher arquivo .json
              </button>
              <input
                type="file"
                accept=".json"
                ref={jsonFileRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleJsonFile(file);
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.space[3] }}>
              <label className="auth-label">Ou cole o JSON aqui</label>
              <textarea
                value={jsonText}
                onChange={handleJsonTextChange}
                placeholder='Cole o JSON dos cartões aqui...'
                rows={8}
                style={{
                  width: '100%',
                  fontFamily: tokens.typography.fontBody,
                  fontSize: tokens.typography.fontSize.sm,
                  padding: `${tokens.space[3]} ${tokens.space[4]}`,
                  borderRadius: tokens.radius.sm,
                  border: `1px solid var(--line)`,
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  resize: 'vertical',
                }}
              />
            </div>

            {importPreview && (
              <div style={{ border: `1px solid var(--line)`, borderRadius: tokens.radius.sm, padding: tokens.space[4], background: tokens.colors.surface }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.space[3] }}>
                  <span style={{ fontWeight: '600', color: tokens.colors.ink, fontSize: tokens.typography.fontSize.sm }}>
                    {importPreview.valid.length} cartão{importPreview.valid.length !== 1 ? 's' : ''} válido{importPreview.valid.length !== 1 ? 's' : ''}
                  </span>
                  {importPreview.invalid.length > 0 && (
                    <span style={{ color: tokens.colors.err, fontSize: tokens.typography.fontSize.sm, fontWeight: '600' }}>
                      {importPreview.invalid.length} com erro{importPreview.invalid.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {importPreview.valid.length > 0 && (
                  <div style={{ marginBottom: tokens.space[3] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.muted, display: 'block', marginBottom: tokens.space[2] }}>
                      Primeiros cartões:
                    </span>
                    {importPreview.valid.slice(0, 3).map((card, i) => (
                      <div key={i} style={{ marginBottom: tokens.space[2], padding: tokens.space[2], background: 'var(--surface-2)', borderRadius: tokens.radius.sm, fontSize: tokens.typography.fontSize.sm }}>
                        <div style={{ fontWeight: '600', color: tokens.colors.ink, marginBottom: tokens.space[1] }}>{card.id}</div>
                        <div style={{ color: tokens.colors.muted }}>{card.question}</div>
                        <div style={{ color: tokens.colors.primary, fontStyle: 'italic' }}>{card.answer}</div>
                      </div>
                    ))}
                  </div>
                )}

                {importPreview.invalid.length > 0 && (
                  <div style={{ marginBottom: tokens.space[3] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.err, fontWeight: '600', display: 'block', marginBottom: tokens.space[2] }}>
                      Itens com erro:
                    </span>
                    {importPreview.invalid.map((err, i) => (
                      <div key={i} style={{ marginBottom: tokens.space[1], padding: tokens.space[2], background: 'var(--err-bg)', borderRadius: tokens.radius.sm, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.err }}>
                        Item {err.index + 1}: {err.reason}
                      </div>
                    ))}
                  </div>
                )}

                {importPreview.valid.length > 0 && importPreview.invalid.length === 0 && (
                  <Button
                    variant="solid"
                    onClick={importValidCards}
                    disabled={importing}
                    style={{ width: '100%', minHeight: '44px' }}
                  >
                    {importing ? 'Importando…' : `Importar ${importPreview.valid.length} cartão${importPreview.valid.length !== 1 ? 's' : ''}`}
                  </Button>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: tokens.space[3], alignItems: 'center', marginTop: tokens.space[3] }}>
              <button
                type="button"
                onClick={downloadModelJson}
                style={{
                  background: 'transparent',
                  border: `1px solid var(--line)`,
                  color: tokens.colors.ink,
                  fontSize: tokens.typography.fontSize.sm,
                  padding: `${tokens.space[2]} ${tokens.space[4]}`,
                  borderRadius: tokens.radius.sm,
                  cursor: 'pointer',
                }}
              >
                Baixar modelo de JSON
              </button>
            </div>
          </div>
        </section>
      )}
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
