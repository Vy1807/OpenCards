import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeck } from './useDeck';
import { useCards } from '../../app/providers/CardsProvider';
import { useAuth } from '../auth/useAuth';
import {
  parseAndValidateImport,
  type ImportCard,
  type ImportValidationError,
} from '../../shared/lib/importCards';
import {
  TrashIcon,
  UploadIcon,
  CloseIcon,
  InfoIcon,
  AlertIcon,
  RefreshIcon,
} from '../../shared/ui/icons';

type Params = { id: string };

type CardView = {
  id: string;
  card_code: string;
  front_text: string;
  back_text: string;
  front_image_path: string | null;
  back_image_path: string | null;
};

export default function DeckEdit() {
  const navigate = useNavigate();
  const { id } = useParams<Params>();
  const {
    deck,
    cards: deckCards,
    loading,
    error,
    refresh,
    updateDeck,
    deleteDeck,
    deleteCard,
  } = useDeck(id!);
  const { updateCard } = useCards();
  const [deckName, setDeckName] = useState('');
  const [deckTag, setDeckTag] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [cards, setCards] = useState<CardView[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      await refresh();
      const currentDeck = deck;
      if (currentDeck) {
        setDeckName(currentDeck.name);
        setDeckTag(currentDeck.tag ?? '');
      }
      setCards(
        deckCards.map((c) => ({
          id: c.id,
          card_code: c.card_code,
          front_text: c.front_text,
          back_text: c.back_text,
          front_image_path: c.front_image_path,
          back_image_path: c.back_image_path,
        }))
      );
    } catch {
      setFormError('Não foi possível carregar o baralho.');
    }
  }, [id, refresh, deck, deckCards]);

  useEffect(() => {
    load();
  }, [load, id]);

  const handleSaveDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) {
      setFormError('Nome é obrigatório.');
      return;
    }
    setFormError('');
    try {
      await updateDeck(id!, { name: deckName.trim(), tag: deckTag.trim() || null });
    } catch {
      setFormError('Não foi possível salvar o baralho.');
    }
  };

  const handleDeleteDeck = async () => {
    if (!confirm('Tem certeza que deseja excluir este baralho? Todos os cartões serão removidos.'))
      return;
    try {
      await deleteDeck(id!);
      navigate('/');
    } catch {
      setFormError('Não foi possível excluir o baralho.');
    }
  };

  if (loading)
    return (
      <div className="page loading-state">
        <h3>Carregando baralho…</h3>
      </div>
    );
  if (error && !deck) {
    return (
      <div className="page error-state">
        <AlertIcon size={32} style={{ marginBottom: '0.75rem', display: 'block' }} />
        <h3>Erro ao carregar</h3>
        <p>{error}</p>
        <button
          className="btn btn-primary"
          onClick={load}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshIcon size={16} /> Tentar de novo
        </button>
      </div>
    );
  }
  if (!deck)
    return (
      <div className="page error-state">
        <AlertIcon size={32} style={{ marginBottom: '0.75rem', display: 'block' }} />
        <h3>Baralho não encontrado.</h3>
        <button
          className="btn"
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshIcon size={16} /> Voltar ao início
        </button>
      </div>
    );

  return (
    <div className="page">
      <header style={{ marginBottom: '1.5rem' }}>
        <h1>Editar baralho</h1>
      </header>
      {formError && <p style={{ color: 'var(--err)', marginBottom: '1rem' }}>{formError}</p>}

      <form onSubmit={handleSaveDeck} className="card section">
        <h2>Baralho</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="label">Nome</label>
            <input
              className="input"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="label">Tag (opcional)</label>
            <input
              className="input"
              value={deckTag}
              onChange={(e) => setDeckTag(e.target.value)}
              placeholder="Ex: #estudo"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Salvar baralho
          </button>
        </div>
        <button
          className="btn btn-danger"
          type="button"
          onClick={handleDeleteDeck}
          style={{
            marginTop: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <TrashIcon size={16} style={{ verticalAlign: 'middle' }} /> Excluir baralho
        </button>
      </form>

      <h2 style={{ marginTop: '2rem' }}>Cartões</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button
          className="btn"
          type="button"
          onClick={() => {
            setImportOpen(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <UploadIcon size={16} style={{ verticalAlign: 'middle' }} /> Importar cartões (JSON)
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <InfoIcon size={18} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
          Dica: use a importação de JSON para adicionar vários cartões de uma vez.
        </span>
      </div>

      {importOpen && (
        <ImportCardForm deckId={id!} onClose={() => setImportOpen(false)} onImported={load} />
      )}

      {cards.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum cartão ainda</h3>
          <p>Adicione um abaixo.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cards.map((card) => (
            <li key={card.id} className="card section">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ color: 'var(--rose-600)' }}>#{card.card_code}</strong>
                  <p style={{ marginTop: '0.25rem', color: 'var(--muted)' }}>{card.front_text}</p>
                </div>
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => handleDeleteCard(card.id)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.875rem',
                    minHeight: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <TrashIcon size={16} style={{ verticalAlign: 'middle' }} /> Excluir
                </button>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label className="label" htmlFor={`card-front-${card.id}`}>Frente</label>
                <input
                  id={`card-front-${card.id}`}
                  className="input"
                  value={card.front_text}
                  onChange={(e) => handleEditCard(card.id, { front_text: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label className="label" htmlFor={`card-back-${card.id}`}>Verso</label>
                <input
                  id={`card-back-${card.id}`}
                  className="input"
                  value={card.back_text}
                  onChange={(e) => handleEditCard(card.id, { back_text: e.target.value })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Adicionar cartão</h3>
      <CardForm deckId={id!} />
    </div>
  );

  function handleEditCard(cardId: string, updates: { front_text?: string; back_text?: string }) {
    updateCard(cardId, updates).catch(() => setFormError('Não foi possível salvar o cartão.'));
  }

  async function handleDeleteCard(cardId: string) {
    if (!confirm('Excluir este cartão?')) return;
    try {
      await deleteCard(cardId);
      setCards((current) => current.filter((c) => c.id !== cardId));
    } catch {
      setFormError('Não foi possível excluir o cartão.');
    }
  }
}

function CardForm({ deckId }: { deckId: string }) {
  const { user } = useAuth();
  const { createCard, uploadImage } = useCards();
  const [cardCode, setCardCode] = useState('');
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<{ front?: string; back?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontText.trim() || !backText.trim()) {
      setError('Frente e verso são obrigatórios.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (!user) throw new Error('Usuário não autenticado');

      let frontPath: string | null | undefined;
      let backPath: string | null | undefined;

      if (frontImage) {
        frontPath = await uploadImage(frontImage, 'front');
      }
      if (backImage) {
        backPath = await uploadImage(backImage, 'back');
      }

      await createCard({
        deck_id: deckId,
        card_code: cardCode.trim() || undefined,
        front_text: frontText.trim(),
        back_text: backText.trim(),
        front_image_path: frontPath,
        back_image_path: backPath,
      });

      setCardCode('');
      setFrontText('');
      setBackText('');
      setFrontImage(null);
      setBackImage(null);
      setImageUrls({});
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message.includes('duplicate')
          ? 'ID do cartão já existe neste baralho.'
          : 'Não foi possível adicionar o cartão.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card section">
      <h3>Novo cartão</h3>
      {error && <p style={{ color: 'var(--err)', marginBottom: '0.75rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label className="label" htmlFor="card-code">ID do cartão (opcional)</label>
          <input
            id="card-code"
            className="input"
            value={cardCode}
            onChange={(e) => setCardCode(e.target.value)}
            placeholder="Ex: CARD-001"
          />
        </div>
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label className="label" htmlFor="front-text">Frente (pergunta)</label>
        <textarea
          id="front-text"
          className="input"
          style={{ minHeight: '80px', resize: 'vertical', padding: '0.625rem 0.875rem' }}
          value={frontText}
          onChange={(e) => setFrontText(e.target.value)}
        />
        {frontImage && (
          <div style={{ marginTop: '0.5rem' }}>
            <label className="label">Imagem da frente</label>
            <UploadIcon
              size={16}
              style={{ verticalAlign: 'middle', marginLeft: '0.5rem', display: 'inline-block' }}
            />
            <img
              src={imageUrls.front || ''}
              alt="frente"
              className="flashcard-image"
              style={{ maxWidth: '200px', display: 'block' }}
            />
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
              style={{ marginTop: '0.25rem' }}
            />
          </div>
        )}
        {!frontImage && (
          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
          />
        )}
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label className="label" htmlFor="back-text">Verso (resposta)</label>
        <textarea
          id="back-text"
          className="input"
          style={{ minHeight: '80px', resize: 'vertical', padding: '0.625rem 0.875rem' }}
          value={backText}
          onChange={(e) => setBackText(e.target.value)}
        />
        {backImage && (
          <div style={{ marginTop: '0.5rem' }}>
            <label className="label">Imagem do verso</label>
            <UploadIcon
              size={16}
              style={{ verticalAlign: 'middle', marginLeft: '0.5rem', display: 'inline-block' }}
            />
            <img
              src={imageUrls.back || ''}
              alt="verso"
              className="flashcard-image"
              style={{ maxWidth: '200px', display: 'block' }}
            />
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => setBackImage(e.target.files?.[0] || null)}
              style={{ marginTop: '0.25rem' }}
            />
          </div>
        )}
        {!backImage && (
          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={(e) => setBackImage(e.target.files?.[0] || null)}
          />
        )}
      </div>
      <button
        className="btn btn-primary"
        type="submit"
        disabled={saving}
        style={{ minHeight: '44px' }}
      >
        {saving ? 'Adicionando…' : 'Adicionar cartão'}
      </button>
    </form>
  );
}

function ImportCardForm({
  deckId,
  onClose,
  onImported,
}: {
  deckId: string;
  onClose: () => void;
  onImported: () => void;
}) {
  const { user } = useAuth();
  const { upsertCard } = useCards();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{
    valid: ImportCard[];
    invalid: ImportValidationError[];
  } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    const parsed = parseAndValidateImport(input);
    setResult(parsed);
  };

  const handleConfirm = async () => {
    if (!result) return;
    setConfirming(true);
    try {
      if (!user) throw new Error('Usuário não autenticado');

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
      onClose();
      onImported();
    } catch {
      setConfirming(false);
      throw new Error('Não foi possível importar os cartões.');
    } finally {
      setConfirming(false);
    }
  };

  if (!result) {
    return (
      <form onSubmit={handleParse} className="card section">
        <h3>Importar cartões</h3>
        <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--muted)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <InfoIcon size={16} style={{ flexShrink: 0 }} />
                  Formato:{' '}
                  <code>
                    {'[{' +
                      '\\\\\\\\\\\\\\\"id\\\\\\\\\\\": \\\\\\\\\\\\\\\"CARD-001\\\\\\\\\\\\\\\", \\\\\\\\\\\\\\\"question\\\\\\\\\\\": \\\\\\\\\\\\\\\"...\\\\\\\\\\\\\\\", \\\\\\\\\\\\\\\"answer\\\\\\\\\\\\\\\"...\\\\\\\\\\\\\\\"' +
                      '}]'}
                  </code>
                </p>
                <label className="label" htmlFor="import-json">JSON para importação</label>
                <textarea
          id="import-json"
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Cole o JSON aqui..."
          style={{ minHeight: '120px', fontFamily: 'monospace', fontSize: '0.875rem' }}
        />
        <button type="button" className="btn" onClick={onClose} style={{ marginRight: '0.5rem' }}>
          Cancelar
        </button>
        <button className="btn btn-primary" type="submit">
          Validar
        </button>
      </form>
    );
  }

  const { valid, invalid } = result;

  return (
    <div className="card section">
      <h3>Prévia da importação</h3>
      <p>
        Válidos: <strong>{valid.length}</strong> | Inválidos: <strong>{invalid.length}</strong>
      </p>

      {invalid.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Itens inválidos:</h4>
          <ul
            style={{
              fontSize: '0.875rem',
              color: 'var(--err)',
              listStyle: 'disc',
              paddingLeft: '1.2rem',
            }}
          >
            {invalid.map((err) => (
              <li key={err.index}>
                Item {err.index + 1}: {err.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn"
          onClick={onClose}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <CloseIcon size={16} style={{ verticalAlign: 'middle' }} /> Cancelar
        </button>
        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={confirming || valid.length === 0}
        >
          {confirming
            ? 'Importando…'
            : `Importar ${valid.length} cartão${valid.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
