import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusPill from './StatusPill';

describe('StatusPill', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'rosa-menta');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('exibe "Em dia" (outline, rosa claro) quando o baralho não tem pendentes', () => {
    render(<StatusPill variant="uptodate" />);
    const pill = screen.getByText('Em dia');
    expect(pill).toBeInTheDocument();
    // happy-dom returns 'transparent' instead of rgba(0, 0, 0, 0)
    expect(pill).toHaveStyle('background-color: transparent');
    expect(pill).toHaveStyle('color: #E0527F');
  });

  it('exibe "X para hoje" (sólida, cor primária) com o número de pendentes', () => {
    render(<StatusPill variant="due" count={3} />);
    const pill = screen.getByText('3 para hoje');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveStyle('background-color: #E0527F');
    expect(pill).toHaveStyle('color: #FFFFFF');
  });

  it('exibe "0 para hoje" quando count é zero em modo devido', () => {
    render(<StatusPill variant="due" count={0} />);
    expect(screen.getByText('0 para hoje')).toBeInTheDocument();
  });
});
