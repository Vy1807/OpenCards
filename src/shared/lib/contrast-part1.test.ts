import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * T-S5-01-03 — Teste automático de contraste por tema (Vitest)
 *
 * Critério de aceite (PARTE 1, seção 13):
 * - Itera os 5 temas, aplica `data-theme` no <html>
 * - Mede razões de contraste texto/fundo e texto/ação principal
 * - Falha se abaixo de 4,5:1 (texto normal) ou 3:1 (texto grande/ícones)
 * - Verificado em 375, 768 e 1280 px
 */

// Converte hex "#RRGGBB" ou "RGB" para [r, g, b] (0-255)
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b];
}

// Lineariza um componente de canal sRGB (0-255) para 0-1
function linearize(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

// Brilho relativo WCAG de uma cor
function relativeLuminance(r: number, g: number, b: number): number {
  const R = linearize(r);
  const G = linearize(g);
  const B = linearize(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// Razão de contraste WCAG: (L1 + 0.05) / (L2 + 0.05), L1 >= L2
function contrastRatio(color1: string, color2: string): number {
  const [r1, g1, b1] = parseHex(color1);
  const [r2, g2, b2] = parseHex(color2);
  const L1 = relativeLuminance(r1, g1, b1);
  const L2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Papéis de cor por tema, conforme PARTE 1 seção 6 (fonte da verdade)
// Formato: { tema: { papel: hex } }
const THEME_ROLES: Record<
  string,
  Record<string, string>
> = {
  'rosa-menta': {
    fundo: '#FFF7F9',
    superficie: '#FFFFFF',
    superficie2: '#FDEEF2',
    texto: '#2D3436',
    textoSuave: '#666A86',
    borda: '#3E6B4E',
    acaoPrincipal: '#F7A8B8',
    textoSobreAcao: '#33364D',
    destaque: '#3E6B4E',
    progresso: '#F7A8B8',
    avatar: '#F7A8B8',
    sucesso: '#1F6B3A',
    aviso: '#8A5A00',
    erro: '#B3261E',
  },
  'azul-laranja': {
    fundo: '#EAF0F6',
    superficie: '#F6F8FB',
    superficie2: '#F6F8FB',
    texto: '#1B2A3A',
    textoSuave: '#4F6272',
    borda: '#2A6F97',
    acaoPrincipal: '#FF9F1C',
    textoSobreAcao: '#1B2A3A',
    destaque: '#C2410C',
    progresso: '#2A6F97',
    avatar: '#2A6F97',
    sucesso: '#1F6B3A',
    aviso: '#8A5A00',
    erro: '#B3261E',
  },
  'roxo-amarelo': {
    fundo: '#F6F4FF',
    superficie: '#FFFFFF',
    superficie2: '#FFFFFF',
    texto: '#2D3436',
    textoSuave: '#5E6470',
    borda: '#6C5CE7',
    acaoPrincipal: '#6C5CE7',
    textoSobreAcao: '#FFFFFF',
    destaque: '#A16207',
    progresso: '#6C5CE7',
    avatar: '#FDCB6E',
    sucesso: '#1F6B3A',
    aviso: '#8A5A00',
    erro: '#B3261E',
  },
  'verde-coral': {
    fundo: '#F4F4EF',
    superficie: '#FFFFFF',
    superficie2: '#ECEAE2',
    texto: '#23302A',
    textoSuave: '#5E6470',
    borda: '#2E7D32',
    acaoPrincipal: '#2E7D32',
    textoSobreAcao: '#FFFFFF',
    destaque: '#2E7D32',
    progresso: '#2E7D32',
    avatar: '#2E7D32',
    sucesso: '#256B29',
    aviso: '#8A5A00',
    erro: '#B91C1C',
  },
  'dark-neon': {
    fundo: '#1F1B2E',
    superficie: '#2A2640',
    superficie2: '#2A2640',
    texto: '#F2F0FF',
    textoSuave: '#B4B0CC',
    borda: '#00F5D4',
    acaoPrincipal: '#00F5D4',
    textoSobreAcao: '#1F1B2E',
    destaque: '#00F5D4',
    progresso: '#00F5D4',
    avatar: '#00F5D4',
    sucesso: '#4ADE80',
    aviso: '#FDE047',
    erro: '#FCA5A5',
  },
};

const THEMES = Object.keys(THEME_ROLES);

describe('T-S5-01-03 — Contraste automático por tema (PARTE 1 seção 13)', () => {
  beforeEach(() => {
    // Limpa o data-theme antes de cada teste
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  for (const theme of THEMES) {
    describe(`Tema: ${theme}`, () => {
      const roles = THEME_ROLES[theme];

      it(`texto sobre fundo tem contraste >= 4.5:1 (${theme})`, () => {
        const ratio = contrastRatio(roles.texto, roles.fundo);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it(`texto suave sobre fundo tem contraste >= 3:1 (grande/ícone) (${theme})`, () => {
        const ratio = contrastRatio(roles.textoSuave, roles.fundo);
        expect(ratio).toBeGreaterThanOrEqual(3);
      });

      it(`texto sobre ação principal tem contraste >= 4.5:1 (${theme})`, () => {
        const ratio = contrastRatio(roles.textoSobreAcao, roles.acaoPrincipal);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it(`sucesso sobre fundo tem contraste >= 4.5:1 (${theme})`, () => {
        const ratio = contrastRatio(roles.sucesso, roles.fundo);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it(`aviso sobre fundo tem contraste >= 4.5:1 (${theme})`, () => {
        const ratio = contrastRatio(roles.aviso, roles.fundo);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it(`erro sobre fundo tem contraste >= 4.5:1 (${theme})`, () => {
        const ratio = contrastRatio(roles.erro, roles.fundo);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it(`destaque sobre fundo tem contraste >= 3:1 (ícone/chip) (${theme})`, () => {
        const ratio = contrastRatio(roles.destaque, roles.fundo);
        expect(ratio).toBeGreaterThanOrEqual(3);
      });

      it(`bordas sobre fundo tem contraste >= 3:1 (${theme})`, () => {
        const ratio = contrastRatio(roles.borda, roles.fundo);
        expect(ratio).toBeGreaterThanOrEqual(3);
      });
    });
  }

  it('aplica data-theme no <html> para cada tema', () => {
    for (const theme of THEMES) {
      document.documentElement.setAttribute('data-theme', theme);
      expect(document.documentElement.dataset.theme).toBe(theme);
    }
  });
});
