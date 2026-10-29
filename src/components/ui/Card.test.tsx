import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from './Card';

describe('Card', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'rosa-menta');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('renderiza filhos com superfície, raio e borda do token', () => {
    const { container } = render(
      <Card padded="md" shadowed>
        Conteúdo do card
      </Card>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveTextContent('Conteúdo do card');
    expect(card).toHaveStyle('background-color: #FFFFFF');
    expect(card).toHaveStyle('border-radius: 16px');
    expect(card).toHaveStyle('border-color: #F3D9E1');
    expect(card).toHaveStyle('box-shadow: 0 4px 12px rgba(224, 82, 127, 0.06)');
  });

  it('suporta card sem preenchimento e sem sombra', () => {
    const { container } = render(
      <Card padded="none" bordered={false} shadowed={false}>
        Simples
      </Card>
    );
    expect(container.firstChild).toHaveStyle('padding: 0');
    expect(container.firstChild).toHaveStyle({ borderStyle: 'none' });
    expect(container.firstChild).toHaveStyle('box-shadow: none');
  });

  it('gera snapshot de regressão visual', () => {
    const { container } = render(
      <Card padded="lg">
        <span data-testid="conteudo">Conteúdo</span>
      </Card>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
