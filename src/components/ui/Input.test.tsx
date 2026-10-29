import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from './Input';

describe('Input', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'rosa-menta');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('associa label ao input via htmlFor', () => {
    render(<Input label="Nome do baralho" id="deck-name" />);
    const input = screen.getByLabelText('Nome do baralho');
    expect(input).toHaveAttribute('id', 'deck-name');
  });

  it('aplica tokens de cor, borda e alvo de toque', () => {
    const { container } = render(<Input label="Input" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toHaveStyle('background-color: #FFFFFF');
    // Verifica que a borda usa variável CSS de papel (resolvida pelo tema)
    expect(input.getAttribute('style')).toContain('var(--role-borda)');
    expect(input).toHaveStyle('min-height: 44px');
  });

  it('mostra mensagem de erro e muda a borda para vermelho', () => {
    const { container } = render(<Input label="Campo" error="Inválido" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(screen.getByText('Inválido')).toBeInTheDocument();
    expect(input).toHaveStyle('border-color: #B3261E');
  });

  it('gera snapshot de regressão visual', () => {
    const { container } = render(<Input label="E-mail" placeholder="exemplo@mail.com" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
