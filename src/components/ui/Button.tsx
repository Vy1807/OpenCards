import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { tokens } from '../../design/tokens';

export type ButtonVariant = 'solid' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'size' | 'color'
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

const SIZE: Record<
  ButtonSize,
  { paddingY: string; paddingX: string; fontSize: string; minHeight: string }
> = {
  sm: {
    paddingY: '0.5rem',
    paddingX: '1rem',
    fontSize: tokens.typography.fontSize.sm,
    minHeight: tokens.touchTarget,
  },
  md: {
    paddingY: '0.75rem',
    paddingX: '1.25rem',
    fontSize: tokens.typography.fontSize.base,
    minHeight: tokens.touchTarget,
  },
};

const VARIANT: Record<ButtonVariant, React.CSSProperties> = {
  solid: {
    background: 'var(--role-acao-principal)',
    color: 'var(--role-texto-sobre-acao)',
    border: '1px solid var(--role-acao-principal)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--role-acao-principal)',
    border: '1px solid var(--role-acao-principal)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--role-texto-suave)',
    border: 'none',
  },
};

export default function Button({
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  style,
  children,
  ...props
}: ButtonProps) {
  const s = SIZE[size];
  const v = VARIANT[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      className={`ui-button ui-button--${variant} ui-button--size-${size} ${className}`.trim()}
      style={{
        boxSizing: 'border-box',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: fullWidth ? '100%' : 'auto',
        minHeight: s.minHeight,
        padding: `${s.paddingY} ${s.paddingX}`,
        borderRadius: tokens.radius.sm,
        fontFamily: tokens.typography.fontBody,
        fontWeight: tokens.typography.fontWeight.medium,
        fontSize: s.fontSize,
        lineHeight: tokens.typography.lineHeight.tight,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition:
          'border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
        outline: 'none',
        ...v,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

Button.displayName = 'Button';
