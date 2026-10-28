/**
 * OpenCards — Kanban empty state.
 */

import type { ReactNode } from 'react';

import { tokens } from '../../../design/tokens';
import Button from '../../../components/ui/Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: tokens.spacing[10],
        textAlign: 'center',
        color: 'var(--muted)',
      }}
    >
      {icon && (
        <div style={{ marginBottom: tokens.spacing[4] }}>{icon}</div>
      )}
      <h3
        style={{
          margin: 0,
          fontFamily: tokens.typography.fontHeading,
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: 'var(--ink)',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            marginTop: tokens.spacing[2],
            fontFamily: tokens.typography.fontBody,
            fontSize: tokens.typography.fontSize.sm,
            color: 'var(--muted)',
          }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          type="button"
          variant="solid"
          onClick={onAction}
          style={{ marginTop: tokens.spacing[4] }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
