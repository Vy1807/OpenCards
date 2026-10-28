import { describe, it, expect } from 'vitest';

/**
 * Converte um valor de canal de cor sRGB (0-255) para linear (0-1).
 */
function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calcula a luminância relativa de uma cor hex (#RRGGBB ou #RGB).
 */
function relativeLuminance(hex: string): number {
  const h = hex.startsWith('#') ? hex.slice(1) : hex;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calcula o ratio de contraste WCAG entre duas cores hex.
 * Retorna um valor >= 1 (1 = sem contraste, 21 = contraste máximo).
 */
function contrastRatio(color1: string, color2: string): number {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Cores de cada tema (valores hex definidos em scrum/backlog.md e color-themes.css).
 * Valores de texto ajustados para garantir contraste WCAG AA:
 * - Texto sobre fundo e texto secundário sobre fundo: >= 4.5:1
 * - Texto sobre cor primária: >= 4.5:1
 * - Texto sobre cor secundária: >= 3:1
 */
const THEME_COLORS: Record<string, Record<string, string>> = {
  'rosa-menta': {
    primary: '#F7A8B8',
    secondary: '#98D8AA',
    background: '#FFF7F9',
    surface: '#FFFFFF',
    text: '#2D3436',
    accent: '#F7A8B8',
    textOnPrimary: '#000000',
    textOnSecondary: '#000000',
    ink: '#2D3436',
    muted: '#4A4E69',
    line: '#98D8AA',
  },
  'azul-laranja': {
    primary: '#2A6F97',
    secondary: '#FF9F1C',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#2A6F97',
    accent: '#FF9F1C',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#1A1A2E',
    ink: '#2A6F97',
    muted: '#4A4E69',
    line: '#FF9F1C',
  },
  'roxo-amarelo': {
    primary: '#6C5CE7',
    secondary: '#FDCB6E',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#2D3436',
    accent: '#6C5CE7',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#1A1A2E',
    ink: '#2D3436',
    muted: '#4A4E69',
    line: '#FDCB6E',
  },
  'verde-coral': {
    primary: '#2E7D32',
    secondary: '#FF6B6B',
    background: '#EFECE6',
    surface: '#FFFFFF',
    text: '#1E542D',
    accent: '#2E7D32',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#1A1A2E',
    ink: '#1E542D',
    muted: '#4A4E69',
    line: '#FF6B6B',
  },
  'dark-neon': {
    primary: '#1E1B2E',
    secondary: '#00F5D4',
    background: '#1E1B2E',
    surface: '#2A2640',
    text: '#F8F9FA',
    accent: '#00F5D4',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#1A1A2E',
    ink: '#F8F9FA',
    muted: '#B2FEFA',
    line: '#00F5D4',
  },
};

describe('T-313: Contraste de cores (WCAG AA) em todos os temas', () => {
  it.each(Object.keys(THEME_COLORS))('tema %s: texto sobre fundo tem contraste >= 4.5:1', (theme) => {
    const colors = THEME_COLORS[theme];
    const ratio = contrastRatio(colors.text, colors.background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it.each(Object.keys(THEME_COLORS))('tema %s: texto secundário sobre fundo tem contraste >= 4.5:1', (theme) => {
    const colors = THEME_COLORS[theme];
    const ratio = contrastRatio(colors.muted, colors.background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it.each(Object.keys(THEME_COLORS))('tema %s: texto sobre cor primária tem contraste >= 4.5:1', (theme) => {
    const colors = THEME_COLORS[theme];
    const ratio = contrastRatio(colors.textOnPrimary, colors.primary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it.each(Object.keys(THEME_COLORS))('tema %s: texto sobre cor secundária tem contraste >= 3.0:1', (theme) => {
    const colors = THEME_COLORS[theme];
    const ratio = contrastRatio(colors.textOnSecondary, colors.secondary);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it('relatório de contraste por tema', () => {
    const report: Record<string, Record<string, number>> = {};
    for (const [theme, colors] of Object.entries(THEME_COLORS)) {
      report[theme] = {
        'texto sobre fundo': contrastRatio(colors.text, colors.background),
        'texto secundário sobre fundo': contrastRatio(colors.muted, colors.background),
        'texto sobre primária': contrastRatio(colors.textOnPrimary, colors.primary),
        'texto sobre secundária': contrastRatio(colors.textOnSecondary, colors.secondary),
      };
    }
    console.log('\n=== Relatório de Contraste WCAG por Tema ===');
    for (const [theme, ratios] of Object.entries(report)) {
      console.log(`\n${theme}:`);
      for (const [pair, ratio] of Object.entries(ratios)) {
        const status = ratio >= 4.5 ? '✓' : ratio >= 3.0 ? '⚠' : '✗';
        console.log(`  ${padEnd(pair, 24)} ${ratio.toFixed(2)}:1 ${status}`);
      }
    }
    console.log('\nLegenda: ✓ >= 4.5:1 (AA texto normal), ⚠ >= 3.0:1 (AA texto grande/ícones), ✗ < 3.0:1 (falha)');
  });
});

function padEnd(str: string, len: number): string {
  return str.padEnd(len, ' ');
}
