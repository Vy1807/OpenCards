import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from './components/Board';
import { type Column, type Card } from './kanban';

// Polyfill de localStorage para rodar também em ambiente 'node' (sem DOM).
// Sob jsdom (CI) o valor nativo é mantido.
if (typeof globalThis.localStorage === 'undefined') {
  const storageData = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storageData.get(key) ?? null,
      setItem: (key: string, value: string) => storageData.set(key, value),
      removeItem: (key: string) => storageData.delete(key),
      clear: () => storageData.clear(),
    },
  });
}

function buildCards(overrides: Partial<Card>[] = []): Card[] {
  const base: Card[] = [
    { id: 'c-1', title: 'Pesquisar sintomas', status: 'TODO', columnId: 'todo', position: 0, updatedAt: new Date().toISOString() },
    { id: 'c-2', title: 'Rascunhar anamnese', status: 'IN_PROGRESS', columnId: 'in-progress', position: 0, updatedAt: new Date().toISOString() },
    { id: 'c-3', title: 'Revisar farmacologia', status: 'TESTING', columnId: 'testing', position: 0, updatedAt: new Date().toISOString() },
    { id: 'c-4', title: 'Entregar relatório', status: 'DONE', columnId: 'done', position: 0, updatedAt: new Date().toISOString() },
  ];
  return overrides.length ? base.map((c, i) => ({ ...c, ...overrides[i] })) : base;
}

const columns: Column[] = [
  { id: 'todo', title: 'TO DO' },
  { id: 'in-progress', title: 'IN PROGRESS' },
  { id: 'testing', title: 'TESTING' },
  { id: 'done', title: 'DONE' },
];

describe('Board', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'rosa-menta');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renderiza o quadro com quatro colunas e os respectivos cartões', () => {
    const cards = buildCards();
    render(<Board columns={columns} cards={cards} onCardMove={() => {}} />);

    expect(screen.getByTestId('column-todo')).toBeInTheDocument();
    expect(screen.getByTestId('column-in-progress')).toBeInTheDocument();
    expect(screen.getByTestId('column-testing')).toBeInTheDocument();
    expect(screen.getByTestId('column-done')).toBeInTheDocument();

    expect(screen.getByTestId('card-c-1')).toBeInTheDocument();
    expect(screen.getByTestId('card-c-2')).toBeInTheDocument();
    expect(screen.getByTestId('card-c-3')).toBeInTheDocument();
    expect(screen.getByTestId('card-c-4')).toBeInTheDocument();

    expect(screen.getByTestId('column-todo')).toContainElement(screen.getByTestId('card-c-1'));
    expect(screen.getByTestId('column-done')).toContainElement(screen.getByTestId('card-c-4'));
  });

  it('pílula de status TODO usa a cor do TO DO (--role-texto-suave)', () => {
    const cards = buildCards();
    render(<Board columns={columns} cards={cards} onCardMove={() => {}} />);

    const card = screen.getByTestId('card-c-1');
    expect(card).toHaveAttribute('draggable', 'true');

    const pill = card.querySelector('.ui-kanban-status-pill');
    expect(pill).not.toBeNull();
    expect(pill).toHaveStyle('border-color: #666A86');
  });

  it('pílula de status DONE usa a cor ok (--role-sucesso)', () => {
    const card: Card = {
      id: 'c-done',
      title: 'Feito',
      status: 'DONE',
      columnId: 'done',
      position: 0,
      updatedAt: new Date().toISOString(),
    };
    render(<Board columns={columns} cards={[card]} onCardMove={() => {}} />);

    const pill = screen.getByTestId('card-c-done').querySelector('.ui-kanban-status-pill');
    expect(pill).not.toBeNull();
    expect(pill).toHaveStyle('border-color: #1F6B3A');
  });

  it('coluna sem cartões exibe estado vazio', () => {
    const cards = buildCards().filter((c) => c.columnId !== 'testing');
    render(<Board columns={columns} cards={cards} onCardMove={() => {}} />);

    expect(screen.getByTestId('column-testing')).toHaveTextContent('Sem cartões');
  });

  it('quadro sem colunas exibe estado vazio do quadro', () => {
    render(<Board columns={[]} cards={[]} onCardMove={() => {}} />);
    expect(screen.getByText('Nenhum quadro configurado')).toBeInTheDocument();
  });

  it('soltar um cartão em uma coluna chama onCardMove com os argumentos corretos', () => {
    const onCardMove = vi.fn();
    const cards = buildCards();
    render(<Board columns={columns} cards={cards} onCardMove={onCardMove} />);

    const target = screen.getByTestId('column-done');

    fireEvent.drop(target, {
      dataTransfer: { getData: () => 'c-1' },
    } as unknown as React.DragEvent<HTMLDivElement>);

    expect(onCardMove).toHaveBeenCalledTimes(1);
    // A coluna destino já tem c-4, então o cartão é anexado na posição 1 (final da coluna).
    expect(onCardMove).toHaveBeenCalledWith('c-1', 'todo', 'done', 1);
  });
});
