import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { tokens } from '../../design/tokens'

export type ButtonVariant = 'solid' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'color'> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: ReactNode
}

const SIZE: Record<
  ButtonSize,
  { paddingY: string; paddingX: string; fontSize: string; minHeight: string }
> = {
  sm: {
    paddingY: '0.5rem',
    paddingX: '1rem',
    fontSize: tokens.typography.fontSize.sm,
    minHeight: '40px',
  },
  md: {
    paddingY: '0.75rem',
    paddingX: '1.25rem',
    fontSize: tokens.typography.fontSize.base,
    minHeight: tokens.touchTarget,
  },
}

const VARIANT: Record<ButtonVariant, React.CSSProperties> = {
  solid: {
    background: tokens.colors.primary,
    color: tokens.colors.inkInverse,
    border: `1px solid ${tokens.colors.primary}`,
  },
  outline: {
    background: 'transparent',
    color: tokens.colors.primary,
    border: `1px solid ${tokens.colors.primary}`,
  },
  ghost: {
    background: 'transparent',
    color: tokens.colors.muted,
    border: 'none',
  },
}

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
  const s = SIZE[size]
  const v = VARIANT[variant]

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
  )
}

Button.displayName = 'Button'
