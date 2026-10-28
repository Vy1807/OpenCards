import { useId } from 'react';

import { tokens } from '../../design/tokens';
import { ChevronDownIcon } from '../../shared/ui/icons';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Select customizado para escolha de baralho de destino.
 * Estilizado com os tokens de design e ícone de chevron integrado.
 */
export default function Select({
  options,
  value,
  onChange,
  label,
  disabled,
  className,
  style,
}: SelectProps) {
  const inputId = useId();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        width: 'auto',
      }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: tokens.typography.fontBody,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.muted,
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          position: 'relative',
          minWidth: '220px',
          width: 'auto',
        }}
      >
        <select
          id={inputId}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`ui-select ${className}`.trim()}
          style={
            {
              boxSizing: 'border-box',
              width: 'auto',
              minWidth: '220px',
              minHeight: tokens.touchTarget,
              padding: '0.625rem 2.5rem 0.625rem 0.875rem',
              borderRadius: tokens.radius.sm,
              border: `1px solid ${tokens.colors.line}`,
              background: tokens.colors.surface,
              color: tokens.colors.ink,
              fontFamily: tokens.typography.fontBody,
              fontSize: tokens.typography.fontSize.base,
              appearance: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              outline: 'none',
              ...style,
            } as React.CSSProperties
          }
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          size={16}
          style={{
            position: 'absolute',
            right: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: tokens.colors.muted,
          }}
        />
      </div>
    </div>
  );
}

Select.displayName = 'Select';
