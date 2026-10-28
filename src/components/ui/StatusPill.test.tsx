import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusPill from './StatusPill';

describe('StatusPill', () => {
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
    // happy-dom returns uppercase hex for colors
    expect(pill).toHaveStyle('color: #FFFFFF');
  });

  it('exibe "0 para hoje" quando count é zero em modo devido', () => {
    render(<StatusPill variant="due" count={0} />);
    expect(screen.getByText('0 para hoje')).toBeInTheDocument();
  });
});
