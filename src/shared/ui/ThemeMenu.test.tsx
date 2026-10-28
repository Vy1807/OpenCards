import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeMenu, { THEMES } from './ThemeMenu';

beforeEach(() => {
  localStorage.removeItem('selected-theme');
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeMenu', () => {
  it('renders a menu button with all 5 themes in dropdown, defaulting to rosa-menta', () => {
    render(<ThemeMenu />);
    const select = screen.getByRole('button', { name: /Tema/ });
    expect(select).toBeInTheDocument();

    // Menu is closed by default
    expect(screen.queryByText('Rosa Suave & Menta')).not.toBeInTheDocument();

    // Open the menu
    fireEvent.click(select);

    for (const theme of THEMES) {
      expect(screen.getByText(theme.name)).toBeInTheDocument();
    }
  });

  it('switches the <html> data-theme in real time and persists the choice', () => {
    render(<ThemeMenu />);
    const select = screen.getByRole('button', { name: /Tema/ });

    expect(document.documentElement.getAttribute('data-theme')).toBe('rosa-menta');

    // Open menu and click azul-laranja
    fireEvent.click(select);
    fireEvent.click(screen.getByText('Azul Foco & Laranja Estudo'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('azul-laranja');
    expect(document.documentElement.getAttribute('data-theme')).not.toBe('rosa-menta');
    expect(localStorage.getItem('selected-theme')).toBe('azul-laranja');

    // Switch again
    fireEvent.click(select);
    fireEvent.click(screen.getByText('Dark Mode Neon'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark-neon');
    expect(document.documentElement.getAttribute('data-theme')).not.toBe('azul-laranja');
    expect(localStorage.getItem('selected-theme')).toBe('dark-neon');
  });

  it('restores the persisted theme on mount', () => {
    localStorage.setItem('selected-theme', 'roxo-amarelo');
    render(<ThemeMenu />);
    const select = screen.getByRole('button', { name: /Tema/ });
    fireEvent.click(select);
    expect(document.documentElement.getAttribute('data-theme')).toBe('roxo-amarelo');
  });

  it('migrates unknown/invalid saved theme to default rosa-menta', () => {
    localStorage.setItem('selected-theme', 'abyss');
    render(<ThemeMenu />);
    const select = screen.getByRole('button', { name: /Tema/ });
    fireEvent.click(select);
    expect(document.documentElement.getAttribute('data-theme')).toBe('rosa-menta');
    expect(localStorage.getItem('selected-theme')).toBe('rosa-menta');
  });

  it('each theme option shows a color preview swatch', () => {
    render(<ThemeMenu />);
    const select = screen.getByRole('button', { name: /Tema/ });
    fireEvent.click(select);

    // Check that each theme option has a swatch
    expect(screen.getByText('Rosa Suave & Menta')).toBeInTheDocument();
    expect(screen.getByText('Azul Foco & Laranja Estudo')).toBeInTheDocument();
    expect(screen.getByText('Roxo Criativo & Amarelo Sol')).toBeInTheDocument();
    expect(screen.getByText('Verde Concentração & Coral')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode Neon')).toBeInTheDocument();
  });
});
