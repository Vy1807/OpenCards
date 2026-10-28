/** OpenCards — página do quadro Kanban (fluxo autônomo TO DO → IN PROGRESS → TESTING → DONE). */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Board from './components/Board';
import { createKanbanStore } from './kanbanStore';
import { defaultColumns, type Card, type ColumnId } from './kanban';

export default function KanbanPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);

  // Uma instância do quadro por sessão da página (inicializada uma vez, estável
  // entre renderizações); o estado persiste em localStorage e sobrevive a
  // recarregamentos.
  const store = useState(() => createKanbanStore({ columns: defaultColumns() }))[0];
  const columns = store.columns;

  useEffect(() => {
    const unsub = store.subscribe(() => setCards(store.cards));
    // A store hidrata do localStorage síncrona e do Supabase de forma
    // assíncrona: ler o estado após inscrever garante que o primeiro
    // render espelhe o estado sincronizado (remoto ou localStorage).
    setCards(store.cards);
    return unsub;
  }, [store]);

  const handleCardMove = useCallback(
    (cardId: string, _fromColumnId: string, toColumnId: string, position: number) => {
      setError(null);
      const result = store.moveCard(cardId, toColumnId as ColumnId, position);
      if (!result.ok) {
        setError(result.error);
      }
    },
    [store]
  );

  const handleAddCard = useCallback(
    (columnId: ColumnId) => {
      setError(null);
      const title = window.prompt('Título do novo cartão:');
      if (!title?.trim()) return;
      store.addCard({ title, columnId });
    },
    [store]
  );

  const handleEditCard = useCallback(
    (cardId: string) => {
      navigate(`/decks/${cardId}/edit`);
    },
    [navigate]
  );

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', padding: '0.25rem 0.75rem' }}
        >
          ← Baralhos
        </button>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Quadro Kanban</h2>
      </header>
      {error && (
        <p
          style={{
            margin: 0,
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            background: '#FBF0EC',
            color: '#B3261E',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </p>
      )}
      <Board
        columns={columns}
        cards={cards}
        onCardMove={handleCardMove}
        onAddCard={handleAddCard}
        onEditCard={handleEditCard}
      />
    </section>
  );
}

KanbanPage.displayName = 'KanbanPage';
