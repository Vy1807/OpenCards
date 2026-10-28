import { SVGProps } from 'react';

export type IconSize = 'sm' | 'md' | 'lg';

const ICON_SIZES: Record<IconSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: IconSize | number;
  title?: string;
}

/**
 * Primitivo de ícone padronizado.
 * - viewBox fixo 0 0 24 24 em todos os ícones
 * - Traço monocromático (currentColor), linha e junção redondas, sem preenchimento
 * - Tamanhos: sm = 16 px, md = 24 px (padrão), lg = 32 px; qualquer número é aceito
 * - Ícones decorativos ficam aria-hidden; com `title` expõem role="img" e tooltip
 */
export function Icon({ children, size = 'md', title, ...props }: IconProps) {
  const dim = typeof size === 'number' ? size : ICON_SIZES[size];

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}
