import { tokens } from '../../design/tokens';

export type StatusPillVariant = 'due' | 'uptodate';

export interface StatusPillProps {
  variant: StatusPillVariant;
  count?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Pill de status de um baralho com base no agendamento Leitner.
 *
 * - `due`: sólida na cor primária, exibe "X para hoje" (cartões para revisar).
 * - `uptodate`: outline em rosa claro, exibe "Em dia" (sem pendências).
 */
export default function StatusPill({ variant, count, className, style }: StatusPillProps) {
  const isDue = variant === 'due';
  const label = isDue ? `${count ?? 0} para hoje` : 'Em dia';

  return (
    <span
      className={`ui-status-pill ui-status-pill--${variant} ${className}`.trim()}
      style={
        {
          boxSizing: 'border-box',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          borderRadius: tokens.radius.full,
          fontFamily: tokens.typography.fontBody,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          padding: '0.25rem 0.625rem',
          minHeight: '24px',
          border: `1px solid`,
          ...(isDue
            ? {
                background: tokens.colors.primary,
                color: tokens.colors.inkInverse,
                borderColor: tokens.colors.primary,
              }
            : {
                background: 'transparent',
                color: tokens.colors.primary,
                borderColor: tokens.colors.primaryLightStronger,
              }),
          ...style,
        } as React.CSSProperties
      }
    >
      {label}
    </span>
  );
}

StatusPill.displayName = 'StatusPill';
