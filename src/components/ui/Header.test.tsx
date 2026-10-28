import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

beforeEach(() => {
  // Limpa o data-theme entre testes para não vazar estado
  document.documentElement.removeAttribute('data-theme');
});

describe('Header', () => {
  it('renders a header with brand name "OpenCards"', () => {
    render(<Header />);
    expect(screen.getByText('OpenCards')).toBeInTheDocument();
  });

  it('shows title when provided', () => {
    render(<Header title="Minha tela" />);
    expect(screen.getByText('Minha tela')).toBeInTheDocument();
  });

  it('shows "Voltar" button when showBack is true', () => {
    render(<Header title="Título" showBack backTo="/" />);
    expect(screen.getByRole('button', { name: /Voltar/ })).toBeInTheDocument();
  });

  it('does not show "Voltar" button when showBack is false', () => {
    render(<Header title="Título" />);
    expect(screen.queryByRole('button', { name: /Voltar/ })).not.toBeInTheDocument();
  });

  it('renders a user avatar with initials', () => {
    render(<Header title="Tela" />);
    // Sem AuthProvider, user é null, então mostra "?"
    const avatar = screen.getByText('?');
    expect(avatar).toBeInTheDocument();
  });

  it('renders ThemeMenu inside header actions', () => {
    render(<Header title="Tela" />);
    expect(screen.getByRole('button', { name: /Tema/ })).toBeInTheDocument();
  });
});
