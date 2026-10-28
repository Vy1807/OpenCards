import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from './Input';

describe('Input', () => {
  it('associa label ao input via htmlFor', () => {
    render(<Input label="Nome do baralho" id="deck-name" />);
    const input = screen.getByLabelText('Nome do baralho');
    expect(input).toHaveAttribute('id', 'deck-name');
  });

  it('aplica tokens de cor, borda e alvo de toque', () => {
    const { container } = render(<Input label="Input" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toHaveStyle('background-color: #FFFFFF');
    expect(input).toHaveStyle('border-color: #F3D9E1');
    expect(input).toHaveStyle('min-height: 44px');
  });

  it('mostra mensagem de erro e muda a borda para vermelho', () => {
    const { container } = render(<Input label="Campo" error="Inválido" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(screen.getByText('Inválido')).toBeInTheDocument();
    expect(input).toHaveStyle('border-color: #E4694F');
  });

  it('gera snapshot de regressão visual', () => {
    const { container } = render(<Input label="E-mail" placeholder="exemplo@mail.com" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
