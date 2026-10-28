/**
 * OpenCards — Kanban card.
 */

import { useCallback } from 'react';

import { tokens } from '../../../design/tokens';
import { PencilIcon } from '../../../shared/ui/icons';
import { type Card } from '../kanban';
import DragHandle from './DragHandle';
import KanbanStatusPill from './KanbanStatusPill';

export interface CardProps {
  card: Card;
  isDragging: boolean;
  onOpen: (cardId: string) => void;
  onDragStart: (cardId: string) => void;
  onDragEnd: () => void;
}

export default function Card({
  card,
  isDragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: CardProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', card.id);
      e.dataTransfer.effectAllowed = 'move';
      onDragStart(card.id);
    },
    [card.id, onDragStart]
  );

  const handleDragEnd = useCallback(() => onDragEnd(), [onDragEnd]);

  return (
    <div
      data-testid={`card-${card.id}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onOpen(card.id)}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[2],
        width: '100%',
        minWidth: 0,
        background: tokens.colors.surface,
        border: `1px solid ${tokens.colors.line}`,
        borderRadius: tokens.radius.md,
        padding: tokens.spacing[4],
        boxShadow: isDragging ? 'none' : tokens.shadows.sm,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease, opacity 0.2s ease',
      } as React.CSSProperties}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: tokens.spacing[3],
        }}
      >
        <DragHandle />
        <KanbanStatusPill status={card.status} />
      </div>
      <h4
        title={card.title}
        style={{
          margin: 0,
          fontFamily: tokens.typography.fontBody,
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.ink,
          lineHeight: tokens.typography.lineHeight.snug,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {card.title}
      </h4>
      {card.category && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            borderRadius: tokens.radius.full,
            background: tokens.colors.primaryLight,
            color: tokens.colors.primary,
            padding: '0.125rem 0.5rem',
            fontFamily: tokens.typography.fontBody,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            marginTop: tokens.spacing[2],
          }}
        >
          <PencilIcon size={10} /> {card.category}
        </span>
      )}
    </div>
  );
}

Card.displayName = 'Card';
