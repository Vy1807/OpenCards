import { tokens } from '../../design/tokens';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  /** Cor do spinner (usa tokens de cor primária por padrão) */
  color?: string;
  /** Texto acessível para screen readers */
  ariaLabel?: string;
}

/**
 * Spinner de carregamento acessível.
 * - Respeita `prefers-reduced-motion` (para a animação).
 * - Tamanhos baseados no design system (sm=20px, md=32px, lg=48px).
 * - Centralizado via flex quando usado sozinho.
 * 
 * As animações são definidas em src/components/ui/ui.css
 */
export default function Spinner({
  size = 'md',
  color = tokens.colors.primary,
  ariaLabel = 'Carregando…',
}: SpinnerProps) {
  const sizeMap = {
    sm: 20,
    md: 32,
    lg: 48,
  };

  const diameter = sizeMap[size];

  return (
    <svg
      role="status"
      aria-label={ariaLabel}
      width={diameter}
      height={diameter}
      viewBox="0 0 32 32"
      className="ui-spinner"
      style={{ color }}
    >
      <title>{ariaLabel}</title>
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="56 28"
        className="ui-spinner__track"
      />
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="56 28"
        className="ui-spinner__indicator"
      />
    </svg>
  );
}