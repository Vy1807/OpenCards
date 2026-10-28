/**
 * OpenCards — Kanban board.
 */

import { useCallback, useMemo, useState } from 'react';

import { tokens } from '../../../design/tokens';
import ProgressBar from '../../../components/ui/ProgressBar';
import Column from './Column';
import EmptyState from './EmptyState';
import {
  type Card as KanbanCard,
  type Column as KanbanColumn,
  type ColumnId,
  defaultColumns,
} from '../kanban';

export interface BoardProps {
  columns?: KanbanColumn[];
  cards: KanbanCard[];
  onCardMove: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    position: number
  ) => void;
  onAddCard?: (columnId: ColumnId) => void;
  onEditCard?: (cardId: string) => void;
}

export default function Board({
  columns: columnsProp = defaultColumns(),
  cards,
  onCardMove,
  onAddCard,
  onEditCard,
}: BoardProps) {
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  const columns = useMemo(() => columnsProp, [columnsProp]);

  const cardsByColumn = useMemo(() => {
    const grouped = new Map<ColumnId, KanbanCard[]>();
    columns.forEach((c) => grouped.set(c.id, []));
    cards.forEach((card) => {
      const arr = grouped.get(card.columnId);
      if (arr) arr.push(card);
    });
    grouped.forEach((arr) => arr.sort((a, b) => a.position - b.position));
    return grouped;
  }, [cards, columns]);

  const total = cards.length;
  const done = cards.filter((c) => c.status === 'DONE').length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const handleCardDragStart = useCallback((cardId: string) => setDraggedCardId(cardId), []);
  const handleCardDragEnd = useCallback(() => setDraggedCardId(null), []);

  const handleColumnDrop = useCallback(
    (columnId: ColumnId, cardId: string, position: number) => {
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;
      onCardMove(card.id, card.columnId, columnId, position);
    },
    [cards, onCardMove]
  );

  return (
    <section
      aria-label="Quadro Kanban"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[6],
        width: '100%',
        background: 'var(--surface)',
      } as React.CSSProperties}
    >
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[3],
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontHeading,
            fontSize: tokens.typography.fontSize.xxl,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: 'var(--ink)',
          }}
        >
          Quadro Kanban
        </h2>
        <ProgressBar value={pct} label={`${pct}% concluído (${done} de ${total})`} />
      </header>
      {columns.length === 0 ? (
        <EmptyState
          title="Nenhum quadro configurado"
          description="Comece criando a primeira coluna."
        />
      ) : (
        <div
          style={{
            display: 'flex',
            gap: tokens.spacing[6],
            overflowX: 'auto',
            padding: `0 0 ${tokens.spacing[6]}`,
          }}
        >
          {columns.map((column) => {
            const columnCards = cardsByColumn.get(column.id) ?? [];
            return (
              <Column
                key={column.id}
                id={column.id}
                title={column.title}
                cards={columnCards}
                draggedCardId={draggedCardId}
                dragOver={false}
                onCardDrop={(cardId: string, position: number) =>
                  handleColumnDrop(column.id, cardId, position)
                }
                onOpenCard={(cardId) => onEditCard?.(cardId)}
                onAddCard={onAddCard ? () => onAddCard(column.id) : undefined}
                onDragStart={handleCardDragStart}
                onDragEnd={handleCardDragEnd}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

Board.displayName = 'Board';
