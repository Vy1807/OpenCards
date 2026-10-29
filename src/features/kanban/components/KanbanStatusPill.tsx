/**
 * OpenCards — Kanban status pill.
 */

import { tokens } from '../../../design/tokens';
import { type CardStatus, STATUS_COLORS, STATUS_LABELS } from '../kanban';

export interface KanbanStatusPillProps {
  status: CardStatus;
  className?: string;
  style?: React.CSSProperties;
}

export default function KanbanStatusPill({
  status,
  className,
  style,
}: KanbanStatusPillProps) {
  const color = STATUS_COLORS[status];

  return (
    <span
      className={`ui-kanban-status-pill ${className ?? ''}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        borderRadius: tokens.radius.full,
        border: `1px solid var(${color})`,
        color: `var(${color})`,
        background: 'transparent',
        padding: '0.25rem 0.625rem',
        fontFamily: tokens.typography.fontBody,
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.semibold,
        ...style,
      } as React.CSSProperties}
    >
      <span
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: `var(${color})`,
        }}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

KanbanStatusPill.displayName = 'KanbanStatusPill';
