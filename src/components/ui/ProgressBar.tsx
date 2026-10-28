import { tokens } from '../../design/tokens';

export interface ProgressBarProps {
  /** Porcentagem de 0 a 100. */
  value: number;
  /** Rotulo exibido ao lado da barra. */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Barra de progresso linear usando a paleta primária (rosa forte no preenchimento,
 * rosa claro no fundo). Usada para mostrar percentual de dominacao e avance da
 * revisao do dia.
 */
export default function ProgressBar({ value, label, className, style }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value ?? 0));

  return (
    <div
      className={`ui-progress-bar ${className}`.trim()}
      style={
        {
          width: '100%',
          height: '10px',
          borderRadius: tokens.radius.full,
          background: tokens.colors.primaryLight,
          overflow: 'hidden',
          ...style,
        } as React.CSSProperties
      }
    >
      <div
        className="ui-progress-bar__fill"
        style={{
          width: `${pct}%`,
          height: '100%',
          background: tokens.colors.primary,
          borderRadius: tokens.radius.full,
          transition: 'width 0.3s ease',
        }}
      />
      {label && (
        <span
          style={{
            display: 'block',
            fontFamily: tokens.typography.fontBody,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.muted,
            marginTop: '0.25rem',
            textAlign: 'right',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

ProgressBar.displayName = 'ProgressBar';
