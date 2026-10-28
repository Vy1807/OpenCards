/**
 * OpenCards — Kanban column.
 */

import { useCallback, useState } from 'react';

import { tokens } from '../../../design/tokens';
import { PlusIcon } from '../../../shared/ui/icons';
import Button from '../../../components/ui/Button';
import Card from './Card';
import EmptyState from './EmptyState';
import { type Card as KanbanCard, type ColumnId } from '../kanban';

export interface ColumnProps {
  id: ColumnId;
  title: string;
  cards: KanbanCard[];
  draggedCardId: string | null;
  dragOver: boolean;
  onCardDrop: (cardId: string, position: number) => void;
  onOpenCard: (cardId: string) => void;
  onAddCard?: () => void;
  onDragStart: (cardId: string) => void;
  onDragEnd: () => void;
}

export default function Column({
  id,
  title,
  cards,
  draggedCardId,
  dragOver,
  onCardDrop,
  onOpenCard,
  onAddCard,
  onDragStart,
  onDragEnd,
}: ColumnProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const cardId = e.dataTransfer?.getData?.('text/plain');
      if (!cardId) return;
      onCardDrop(cardId, cards.length);
    },
    [cards, onCardDrop]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const handleAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!draft.trim()) return;
      onAddCard?.();
      setDraft('');
      setAdding(false);
    },
    [draft, onAddCard]
  );

  return (
    <section
      data-testid={`column-${id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[3],
        minWidth: '300px',
        width: 280,
        background: tokens.colors.background,
        borderRadius: tokens.radius.md,
        padding: tokens.spacing[3],
        border: dragOver
          ? `2px dashed ${tokens.colors.primary}`
          : `1px solid transparent`,
        boxShadow: tokens.shadows.md,
      } as React.CSSProperties}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: tokens.spacing[2],
          marginBottom: tokens.spacing[2],
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontHeading,
            fontSize: tokens.typography.fontSize.xxl,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.ink,
          }}
        >
          {title}
        </h3>
        <span
          style={{
            fontFamily: tokens.typography.fontBody,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.muted,
          }}
        >
          {cards.length} cartões
        </span>
      </header>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[3],
          flex: 1,
          minHeight: 0,
        }}
      >
        {cards.length === 0 ? (
          <EmptyState
            title="Sem cartões"
            description="Arraste um cartão para cá ou clique em +."
          />
        ) : (
          cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              isDragging={card.id === draggedCardId}
              onOpen={onOpenCard}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
      {onAddCard ? (
        <footer style={{ marginTop: tokens.spacing[2] }}>
          {adding ? (
            <form
              onSubmit={handleAdd}
              style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}
            >
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Título do cartão..."
                style={{
                  fontFamily: tokens.typography.fontBody,
                  fontSize: tokens.typography.fontSize.sm,
                  padding: '0.625rem 0.875rem',
                  borderRadius: tokens.radius.sm,
                  border: `1px solid ${tokens.colors.line}`,
                  background: tokens.colors.surface,
                  color: tokens.colors.ink,
                  width: '100%',
                }}
              />
              <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                <Button variant="solid" type="submit" size="sm">
                  Adicionar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraft('');
                    setAdding(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="ghost"
              fullWidth
              size="sm"
              onClick={() => setAdding(true)}
              style={{
                color: tokens.colors.primary,
                border: `1px dashed ${tokens.colors.primary}`,
                textAlign: 'left',
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
              }}
            >
              <PlusIcon size={14} /> Adicionar cartão
            </Button>
          )}
        </footer>
      ) : null}
    </section>
  );
}

Column.displayName = 'Column';
