import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCards } from '../../app/providers';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import { UploadIcon, ArrowLeftIcon, AlertIcon, CheckIcon } from '../../shared/ui/icons';
import { parseAndValidateImport, type ImportCard } from '../../shared/lib/importCards';
import { tokens } from '../../design/tokens';

export type SimpleImportError = { index: number; reason: string };

/**
 * Tela "Importar em Lote" (Protegida).
 *
 * - 1. Select de baralho de destino.
 * - 2. Dropzone com arrastar/soltar (onDragOver/onDrop) + FileReader, com area
 *    de texto como fallback.
 * - Validacao via parseAndValidateImport: bloqueia o botao e exibe aviso de erro
 *   quando o formato estiver incorreto.
 * - Importacao chama upsertCard por item valido e exibe toast de resultado.
 */
export default function Import() {
  const navigate = useNavigate();
  const { decks, upsertCard, fetchDecks } = useCards();
  const [deckId, setDeckId] = useState<string>('');
  const [input, setInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<{
    valid: ImportCard[];
    invalid: SimpleImportError[];
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string | undefined;
      if (typeof text === 'string') setInput(text);
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const handleParse = useCallback(() => {
    setResult(null);
    setToast(null);
    const parsed = parseAndValidateImport(input);
    setResult({
      valid: parsed.valid,
      invalid: parsed.invalid.map((i) => ({ index: i.index, reason: i.reason })),
    });
  }, [input]);

  const handleImport = useCallback(async () => {
    if (!result || result.valid.length === 0) return;
    if (!deckId) {
      setToast({ type: 'error', message: 'Selecione um baralho de destino.' });
      return;
    }
    setImporting(true);
    setToast(null);
    try {
      for (const card of result.valid) {
        await upsertCard({
          deck_id: deckId,
          card_code: card.id,
          front_text: card.question,
          back_text: card.answer,
          front_image_path: null,
          back_image_path: null,
        });
      }
      setToast({
        type: 'success',
        message: `${result.valid.length} card${result.valid.length !== 1 ? 's' : ''} importado${
          result.valid.length !== 1 ? 's' : ''
        } com sucesso.`,
      });
      setInput('');
      setResult(null);
    } catch {
      setToast({ type: 'error', message: 'Não foi possível importar os cartões.' });
    } finally {
      setImporting(false);
    }
  }, [deckId, result, upsertCard]);

  const hasValid = result ? result.valid.length > 0 : false;
  const toastColor = toast?.type === 'success' ? tokens.colors.ok : tokens.colors.err;

  return (
    <div className="page" style={{ maxWidth: '720px', margin: '0 auto', padding: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeftIcon size={18} style={{ flexShrink: 0 }} /> ← Baralhos
        </button>
      </div>

      {toast && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: tokens.radius.md,
            background: toast.type === 'success' ? tokens.colors.okBg : tokens.colors.errBg,
            color: toastColor,
            border: `1px solid ${toastColor}`,
            marginBottom: '1rem',
            fontSize: tokens.typography.fontSize.sm,
            fontFamily: tokens.typography.fontBody,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {toast.type === 'success' ? <CheckIcon size={18} /> : <AlertIcon size={18} />}
          {toast.message}
        </div>
      )}

      <h1
        style={{
          fontFamily: tokens.typography.fontHeading,
          fontSize: tokens.typography.fontSize.xxl,
          color: tokens.colors.ink,
          margin: '0 0 1rem 0',
        }}
      >
        Importar em lote
      </h1>

      <Card padded="lg" shadowed style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.75rem 0', fontSize: tokens.typography.fontSize.lg }}>
          1. Baralho de destino
        </h2>
        <Select
          label="Baralho de destino"
          options={decks.map((d) => ({ value: d.id, label: d.name }))}
          value={deckId}
          onChange={setDeckId}
        />
        {decks.length === 0 && (
          <p
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.muted,
              marginTop: '0.5rem',
            }}
          >
            Nenhum baralho disponível. Crie um primeiro.
          </p>
        )}
      </Card>

      <Card padded="lg" shadowed style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.75rem 0', fontSize: tokens.typography.fontSize.lg }}>
          2. Arquivo ou texto
        </h2>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${
              dragActive ? tokens.colors.primary : tokens.colors.primaryLightStronger
            }`,
            borderRadius: tokens.radius.md,
            background: dragActive ? tokens.colors.primaryLight : '#FDFCFE',
            padding: tokens.spacing[10],
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, background-color 0.2s ease',
          }}
        >
          <UploadIcon size={48} style={{ flexShrink: 0 }} />
          <p
            style={{
              margin: '0.75rem 0 0.25rem 0',
              fontWeight: '700',
              fontFamily: tokens.typography.fontBody,
            }}
          >
            Escolher arquivo .json
          </p>
          <p
            style={{
              margin: 0,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.muted,
            }}
          >
            Arraste um arquivo JSON ou clique para selecionar.
          </p>
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h3
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.muted,
            }}
          >
            Ou cole o JSON
          </h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
        </div>

        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <Button variant="solid" onClick={handleParse} disabled={!input.trim() || importing}>
            Validar
          </Button>
          <Button
            variant="outline"
            onClick={handleImport}
            disabled={importing || !hasValid || !deckId}
          >
            {importing ? 'Importando…' : 'Importar cards'}
          </Button>
        </div>
      </Card>

      {result && (
        <Card padded="lg" shadowed>
          <h2 style={{ margin: '0 0 0.75rem 0', fontSize: tokens.typography.fontSize.lg }}>
            Pré-visualização
          </h2>
          <p>
            Válidos: <strong>{result.valid.length}</strong> | Inválidos:{' '}
            <strong>{result.invalid.length}</strong>
          </p>
          {result.invalid.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <h4
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  marginBottom: '0.25rem',
                  color: tokens.colors.err,
                }}
              >
                Itens inválidos:
              </h4>
              <ul
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.err,
                  listStyle: 'disc',
                  paddingLeft: '1.2rem',
                }}
              >
                {result.invalid.map((err) => (
                  <li key={err.index}>
                    Item {err.index + 1}: {err.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setResult(null)}>
              Limpar
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

Import.displayName = 'Import';
