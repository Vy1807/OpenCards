import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from './Modal';

describe('Modal', () => {
  it('não renderiza nada quando fechado', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>
        Conteúdo
      </Modal>
    );
    expect(container.innerHTML).toBe('');
  });

  it('renderiza painel com role de diálogo e título', () => {
    const { container } = render(
      <Modal isOpen onClose={() => {}} title="Novo card">
        Conteúdo do modal
      </Modal>
    );
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Novo card')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
  });

  it('fecha ao clicar no botão de fechar', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Título">
        Conteúdo
      </Modal>
    );
    fireEvent.click(screen.getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fecha ao clicar no backdrop, não no painel', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen onClose={onClose} title="Título">
        Conteúdo
      </Modal>
    );
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
    const panel = dialog.querySelector('.ui-modal__panel') as HTMLElement;
    fireEvent.click(panel);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fecha pressionando Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Título">
        Conteúdo
      </Modal>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('gera snapshot de regressão visual (aberto)', () => {
    const { container } = render(
      <Modal isOpen onClose={() => {}} title="Título do modal">
        Corpo do modal
      </Modal>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
