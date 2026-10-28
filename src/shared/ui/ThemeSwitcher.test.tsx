import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeSwitcher, { THEMES } from './ThemeSwitcher';

beforeEach(() => {
  localStorage.removeItem('selected-theme');
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeSwitcher', () => {
  it('renders a select with all 5 themes, defaulting to rosa-menta', () => {
    render(<ThemeSwitcher />);
    const select = screen.getByRole('combobox', { name: 'Tema' });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('rosa-menta');

    for (const theme of THEMES) {
      expect(screen.getByRole('option', { name: theme.name })).toBeInTheDocument();
    }
  });

  it('switches the <html> data-theme in real time and persists the choice', () => {
    render(<ThemeSwitcher />);
    const select = screen.getByRole('combobox', { name: 'Tema' }) as HTMLSelectElement;

    expect(document.documentElement.getAttribute('data-theme')).toBe('rosa-menta');

    fireEvent.change(select, { target: { value: 'azul-laranja' } });
    expect(document.documentElement.getAttribute('data-theme')).toBe('azul-laranja');
    expect(document.documentElement.getAttribute('data-theme')).not.toBe('rosa-menta');
    expect(localStorage.getItem('selected-theme')).toBe('azul-laranja');

    fireEvent.change(select, { target: { value: 'dark-neon' } });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark-neon');
    expect(document.documentElement.getAttribute('data-theme')).not.toBe('azul-laranja');
    expect(localStorage.getItem('selected-theme')).toBe('dark-neon');
  });

  it('restores the persisted theme on mount', () => {
    localStorage.setItem('selected-theme', 'roxo-amarelo');
    render(<ThemeSwitcher />);
    const select = screen.getByRole('combobox', { name: 'Tema' }) as HTMLSelectElement;
    expect(select.value).toBe('roxo-amarelo');
    expect(document.documentElement.getAttribute('data-theme')).toBe('roxo-amarelo');
  });

  it('only sets data-theme for the active theme', () => {
    render(<ThemeSwitcher />);
    const select = screen.getByRole('combobox', { name: 'Tema' }) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'verde-coral' } });
    expect(document.documentElement.getAttribute('data-theme')).toBe('verde-coral');
  });
});
