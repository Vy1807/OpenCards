import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

import { tokens } from '../../design/tokens';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  helper,
  fullWidth = false,
  disabled = false,
  className = '',
  style,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: tokens.typography.fontBody,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: error ? tokens.colors.err : tokens.colors.muted,
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        disabled={disabled}
        className={`ui-input ${className}`.trim()}
        style={{
          boxSizing: 'border-box',
          width: '100%',
          minHeight: tokens.touchTarget,
          padding: '0.625rem 0.875rem',
          borderRadius: tokens.radius.sm,
          border: `1px solid ${error ? tokens.colors.err : tokens.colors.line}`,
          background: tokens.colors.surface,
          color: tokens.colors.ink,
          fontFamily: tokens.typography.fontBody,
          fontSize: tokens.typography.fontSize.base,
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
          outline: 'none',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span
          style={{
            fontFamily: tokens.typography.fontBody,
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.err,
          }}
        >
          {error}
        </span>
      )}
      {!error && helper && (
        <span
          style={{
            fontFamily: tokens.typography.fontBody,
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.muted,
          }}
        >
          {helper}
        </span>
      )}
    </div>
  );
}

Input.displayName = 'Input';
