import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renderiza o preenchimento com a porcentagem informada', () => {
    const { container } = render(<ProgressBar value={65} />);
    const fill = container.querySelector('.ui-progress-bar__fill');
    expect(fill).toHaveStyle('width: 65%');
  });

  it('exibe o rotulo quando informado', () => {
    const { container } = render(<ProgressBar value={40} label="60% dominado" />);
    expect(container).toHaveTextContent('60% dominado');
  });

  it('limita a porcentagem entre 0 e 100', () => {
    const { container } = render(<ProgressBar value={150} />);
    const fill = container.querySelector('.ui-progress-bar__fill');
    expect(fill).toHaveStyle('width: 100%');
  });
});
