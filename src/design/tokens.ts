/**
 * OpenCards — design tokens (sistema de design).
 *
 * Fonte única de verdade dos valores visuais: cores, tipografia, espaçamento,
 * raios, sombras, durações e alvos de toque.
 *
 * Espelha src/styles/tokens.css (variáveis CSS do modo claro). Quando um valor
 * mudar aqui, espelhe no CSS (e vice-versa): não há build que gere um do outro.
 *
 * Consumido pelos componentes base de src/components/ui (Button, Input, Card,
 * Modal) via estilos inline, o que deixa o HTML renderizado determinístico e
 * viabiliza testes de regressão visual por snapshot.
 */

export type ColorScheme = 'light' | 'dark';

/** Paleta do modo claro (espelha :root em src/styles/tokens.css). */
export const colors = {
  // marca (rosa / carmim)
  primary: '#E0527F', // destaque principal: botão sólido, ícones ativos, progresso ativo
  primaryHover: '#C73E6B', // hover / ativo
  primaryLight: '#FCE4EC', // fundo de card de pré-visualização, input, progresso inativo
  primaryLightStronger: '#F5D6E4',

  // superfície
  background: '#FFF7F9', // fundo global
  surface: '#FFFFFF', // fundo de componentes elevados (card, input, modal)
  surfaceHover: '#FFF1F5', // hover sutil de superfície

  // texto
  ink: '#2B2024', // texto principal
  inkInverse: '#FFFFFF', // texto sobre fundo primário
  muted: '#8A7580', // texto secundário / desabilitado
  mutedSoft: '#6E5C64',

  // linhas e bordas
  line: '#F3D9E1', // borda padrão
  lineFocus: '#E0527F', // foco de teclado

  // semântico
  ok: '#4FA38A', // acertei
  okBg: '#EFF7F3', // fundo suave de sucesso
  err: '#E4694F', // errei
  errBg: '#FBF0EC', // fundo suave de erro

  // contraste de texto sobre cores de estado
  onErr: '#2B2024',   // texto sobre fundo de erro
  onOk: '#FFFFFF',    // texto sobre fundo de sucesso
  onPrimary: '#FFFFFF', // texto sobre fundo primário

  // tokens adicionais do sistema de design (T-310)
  surface2: '#F4ECF0',   // superfície secundária
  secondary: '#6B7280',   // cor secundária
  onSecondary: '#FFFFFF', // texto sobre cor secundária
  warning: '#F59E0B',     // aviso / atenção
  focusRing: '#0EA5E9',   // anel de foco de teclado

  // desabilitado
  disabledOpacity: 0.55,
};

export const colorSchemes: Record<ColorScheme, typeof colors> = {
  light: colors,
  dark: {
    ...colors,
    background: '#1E1419',
    surface: '#2A1D24',
    surfaceHover: '#3A2A33',
    ink: '#F5E8EC',
    muted: '#B08C98',
    mutedSoft: '#9B7A88',
    line: '#3A2A30',
    lineFocus: '#F5A3BE',
    okBg: '#1E332A',
    errBg: '#3E2620',
    primaryLight: '#3A1F2B',
    primaryLightStronger: '#5A2A40',
    disabledOpacity: 0.45,
    surface2: '#2A1D24',
    secondary: '#9CA3AF',
    onSecondary: '#1E1419',
    warning: '#FBBF24',
    focusRing: '#38BDF8',
  },
};

export const typography = {
  fontHeading: "'Fraunces', Georgia, serif",
  fontBody: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    xxl: '1.5rem', // 24px
  },
  lineHeight: {
    tight: '1.2',
    snug: '1.375',
    normal: '1.5',
    loose: '1.75',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

/* Escala de espaçamento 4/8px (U-320) — espelha --space-1 a --space-8 em tokens.css. */
export const space = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
} as const;

export const radius = {
  sm: '12px',
  md: '16px',
  lg: '24px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 4px 12px rgba(224, 82, 127, 0.06)',
  md: '0 8px 24px rgba(224, 82, 127, 0.10)',
  lg: '0 16px 40px rgba(224, 82, 127, 0.12)',
  inset: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
} as const;

export const transitions = {
  fast: '0.2s ease',
  spring: '0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  modal: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export const touchTarget = '44px';

export const zIndex = {
  dropdown: 50,
  modalBackdrop: 100,
  modal: 110,
  toast: 200,
} as const;

export const breakpoints = {
  mobile: '767px',   /* até 767px: estilos base mobile */
  tablet: '768px',   /* 768px a 1023px: @media (min-width: 768px) */
  desktop: '1024px', /* 1024px em diante: @media (min-width: 1024px) */
} as const;

/**
 * Bundle consumido pelos componentes base. `scheme` alterna a paleta
 * (padrão 'light'); o modo escuro segue o CSS de src/styles/tokens.css
 * até que os componentes leiam o esquema ativo do DOM.
 */
export interface DesignTokens {
  colors: typeof colors;
  colorSchemes: typeof colorSchemes;
  typography: typeof typography;
  spacing: typeof spacing;
  space: typeof space;
  radius: typeof radius;
  shadows: typeof shadows;
  transitions: typeof transitions;
  touchTarget: string;
  zIndex: typeof zIndex;
  breakpoints: typeof breakpoints;
}

export const tokens: DesignTokens = {
  colors,
  colorSchemes,
  typography,
  spacing,
  space,
  radius,
  shadows,
  transitions,
  touchTarget,
  zIndex,
  breakpoints,
};
