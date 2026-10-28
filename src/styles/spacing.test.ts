import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const CSS_PATH = path.resolve(process.cwd(), 'src/styles/tokens.css');

async function readCss(): Promise<string> {
  return readFile(CSS_PATH, 'utf-8');
}

function extractCustomProperty(css: string, property: string): string | null {
  const regex = new RegExp(`${property}\\s*:\\s*([^;]+)`, 'i');
  const match = css.match(regex);
  return match ? match[1].trim() : null;
}

function extractRule(css: string, selector: string): string | null {
  const regex = new RegExp(`${selector}\\s*\\{([^}]+)\\}`, 's');
  const match = css.match(regex);
  return match ? match[1] : null;
}

describe('U-320: Escala de espaçamento e container centralizado', () => {
  it('possui tokens --space-1 a --space-8 com escala 4/8px no :root', async () => {
    const css = await readCss();

    expect(extractCustomProperty(css, '--space-1')).toBe('4px');
    expect(extractCustomProperty(css, '--space-2')).toBe('8px');
    expect(extractCustomProperty(css, '--space-3')).toBe('12px');
    expect(extractCustomProperty(css, '--space-4')).toBe('16px');
    expect(extractCustomProperty(css, '--space-5')).toBe('20px');
    expect(extractCustomProperty(css, '--space-6')).toBe('24px');
    expect(extractCustomProperty(css, '--space-7')).toBe('28px');
    expect(extractCustomProperty(css, '--space-8')).toBe('32px');
  });

  it('container .page tem max-width 720px e usa tokens de espaçamento', async () => {
    const css = await readCss();
    const pageRule = extractRule(css, '.page');

    expect(pageRule).toContain('max-width: 720px');
    expect(pageRule).toContain('var(--space-8)');
    expect(pageRule).toContain('var(--space-4)');
  });

  it('.page mobile (max-width: 640px) tem margem 16px', async () => {
    const css = await readCss();
    const mediaMatch = css.match(/@media \(max-width: 640px\)\s*\{\s*\.page\s*\{([^}]+)\}/s);
    expect(mediaMatch).not.toBeNull();
    const mobileRule = mediaMatch![1];
    expect(mobileRule).toContain('margin: 0 var(--space-4)');
  });

  it('componentes base usam tokens de espaçamento (.btn, .input, .card, .label)', async () => {
    const css = await readCss();

    const btnRule = extractRule(css, '.btn');
    expect(btnRule).toContain('gap: var(--space-3)');
    expect(btnRule).toContain('padding: var(--space-3) var(--space-5)');

    const inputRule = extractRule(css, '.input');
    expect(inputRule).toContain('padding: var(--space-3) var(--space-4)');

    const cardRule = extractRule(css, '.card');
    expect(cardRule).toContain('padding: var(--space-5)');
    expect(cardRule).toContain('margin-bottom: var(--space-4)');

    const labelRule = extractRule(css, '.label');
    expect(labelRule).toContain('margin-bottom: var(--space-2)');
  });

  it('alvos de toque >= 44x44px (--touch-target)', async () => {
    const css = await readCss();

    expect(extractCustomProperty(css, '--touch-target')).toBe('44px');

    const btnRule = extractRule(css, '.btn');
    expect(btnRule).toContain('min-height: var(--touch-target)');

    const inputRule = extractRule(css, '.input');
    expect(inputRule).toContain('min-height: var(--touch-target)');
  });

  it('espaço entre blocos (--space-6 = 24px) e itens relacionados (--space-2 = 8px)', async () => {
    const css = await readCss();
    const sectionRule = extractRule(css, '.section');
    expect(sectionRule).toContain('margin-bottom: var(--space-6)');
  });
});
