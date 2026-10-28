import type { ReactNode } from 'react';

import { tokens } from '../../design/tokens';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: ReactNode;
  padded?: CardPadding;
  bordered?: boolean;
  shadowed?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const PADDING: Record<CardPadding, string> = {
  none: '0',
  sm: tokens.spacing[3],
  md: tokens.spacing[6],
  lg: tokens.spacing[10],
};

export default function Card({
  children,
  padded = 'md',
  bordered = true,
  shadowed = true,
  fullWidth = false,
  className = '',
  style,
}: CardProps) {
  return (
    <div
      className={`ui-card ${padded !== 'none' ? `ui-card--padded-${padded}` : ''} ${className}`.trim()}
      style={
        {
          boxSizing: 'border-box',
          display: 'block',
          width: fullWidth ? '100%' : 'auto',
          borderRadius: tokens.radius.md,
          background: tokens.colors.surface,
          border: bordered ? `1px solid ${tokens.colors.line}` : 'none',
          boxShadow: shadowed ? tokens.shadows.sm : 'none',
          padding: PADDING[padded],
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

Card.displayName = 'Card';
