/**
 * OpenCards — Kanban drag handle (accessible grip for draggable cards).
 */

export interface DragHandleProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function DragHandle({
  className,
  style,
}: DragHandleProps) {
  const dot = {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--muted)',
  };

  return (
    <span
      role="button"
      aria-label="Arrastar cartão"
      tabIndex={0}
      className={`ui-kanban-drag-handle ${className ?? ''}`.trim()}
      style={{
        display: 'inline-flex',
        gap: '4px',
        color: 'var(--muted)',
        cursor: 'grab',
        userSelect: 'none',
        ...style,
      } as React.CSSProperties}
    >
      <span style={dot} />
      <span style={dot} />
      <span style={dot} />
    </span>
  );
}

DragHandle.displayName = 'DragHandle';
