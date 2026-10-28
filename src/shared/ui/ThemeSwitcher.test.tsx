import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeSwitcher, { THEMES } from './ThemeSwitcher';

beforeEach(() => {
  localStorage.removeItem('selected-theme');
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeSwitcher', () => {
  it('renders a select with all 8 themes, defaulting to slate', () => {
    render(<ThemeSwitcher />);
    const select = screen.getByRole('combobox', { name: 'Tema' });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('slate');

    for (const theme of THEMES) {
      expect(screen.getByRole('option', { name: theme.name })).toBeInTheDocument();
    }
  });

  it('switches the <html> data-theme in real time and persists the choice', () => {
    render(<ThemeSwitcher />);
    const select = screen.getByRole('combobox', { name: 'Tema' }) as HTMLSelectElement;

    expect(document.documentElement.getAttribute('data-theme')).toBe('slate');

    fireEvent.change(select, { target: { value: 'cobalt' } });
    expect(document.documentElement.getAttribute('data-theme')).toBe('cobalt');
    expect(document.documentElement.getAttribute('data-theme')).not.toBe('slate');
    expect(localStorage.getItem('selected-theme')).toBe('cobalt');

    fireEvent.change(select, { target: { value: 'zinc' } });
    expect(document.documentElement.getAttribute('data-theme')).toBe('zinc');
    expect(document.documentElement.getAttribute('data-theme')).not.toBe('cobalt');
    expect(localStorage.getItem('selected-theme')).toBe('zinc');
  });

  it('restores the persisted theme on mount', () => {
    localStorage.setItem('selected-theme', 'rose');
    render(<ThemeSwitcher />);
    const select = screen.getByRole('combobox', { name: 'Tema' }) as HTMLSelectElement;
    expect(select.value).toBe('rose');
    expect(document.documentElement.getAttribute('data-theme')).toBe('rose');
  });

  it('only sets data-theme for the active theme', () => {
    render(<ThemeSwitcher />);
    const select = screen.getByRole('combobox', { name: 'Tema' }) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'zinc' } });
    expect(document.documentElement.getAttribute('data-theme')).toBe('zinc');
  });
});
