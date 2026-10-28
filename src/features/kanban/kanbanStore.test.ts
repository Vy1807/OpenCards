import { afterEach, describe, expect, it } from 'vitest';

import { createKanbanStore } from './kanbanStore';
import { type Card, type CardMovedEvent } from './kanban';

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

const STORAGE_KEY = 'opencards:kanban:cards';

function ok(result: { ok: boolean; card?: Card; error?: string }): Card {
  expect(result.ok).toBe(true);
  return result.card!;
}

describe('KanbanStore', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('inicia com as quatro colunas padrão e nenhum cartão', () => {
    const store = createKanbanStore();
    expect(store.columns.map((c) => c.id)).toEqual(['todo', 'in-progress', 'testing', 'done']);
    expect(store.cards).toEqual([]);
  });

  it('addCard deriva o status da coluna (COLUMN_ID_TO_STATUS) e persiste', () => {
    const store = createKanbanStore();
    const card = store.addCard({ title: 'Revisar ECG', columnId: 'testing' });

    expect(card.id).toBeDefined();
    expect(card.title).toBe('Revisar ECG');
    expect(card.status).toBe('TESTING');
    expect(card.columnId).toBe('testing');
    expect(card.position).toBe(0);
    expect(card.updatedAt).toBeDefined();

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([card]);
  });

  it('addCard trim espaços do título', () => {
    const store = createKanbanStore();
    const card = store.addCard({ title: '  Espaços  ', columnId: 'todo' });
    expect(card.title).toBe('Espaços');
  });

  it('moveNext avança um passo de cada vez até DONE', () => {
    const store = createKanbanStore();
    const card = store.addCard({ title: 'C1', columnId: 'todo' });

    let result = ok(store.moveNext(card.id) as { ok: true; card: Card });
    expect(result.status).toBe('IN_PROGRESS');
    expect(result.columnId).toBe('in-progress');

    result = ok(store.moveNext(card.id) as { ok: true; card: Card });
    expect(result.status).toBe('TESTING');
    expect(result.columnId).toBe('testing');

    result = ok(store.moveNext(card.id) as { ok: true; card: Card });
    expect(result.status).toBe('DONE');
    expect(result.columnId).toBe('done');
  });

  it('moveNext no cartão já em DONE é rejeitado (DONE é terminal)', () => {
    const store = createKanbanStore();
    const card = store.addCard({ title: 'C1', columnId: 'done' }); // status DONE

    const result = store.moveNext(card.id) as { ok: false; error: string };
    expect(result.ok).toBe(false);
    expect(result.error).toBe('No further transition allowed');
    expect(store.cards.find((c) => c.id === card.id)?.status).toBe('DONE');
  });

  it('moveNext em cartão inexistente é rejeitado', () => {
    const store = createKanbanStore();
    const result = store.moveNext('desconhecido') as {
      ok: false;
      error: string;
    };
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Card not found');
  });

  it('canTransition rejeita saltos de etapa e reversões', () => {
    const store = createKanbanStore();
    const card = store.addCard({ title: 'C1', columnId: 'todo' }); // TODO

    expect(store.canTransition(card.id, 'IN_PROGRESS')).toBe(true);
    expect(store.canTransition(card.id, 'TESTING')).toBe(false); // salto
    expect(store.canTransition(card.id, 'DONE')).toBe(false); // salto
    expect(store.canTransition(card.id, 'TODO')).toBe(false); // não é passo adiante

    store.moveNext(card.id); // IN_PROGRESS
    expect(store.canTransition(card.id, 'TESTING')).toBe(true);
    expect(store.canTransition(card.id, 'TODO')).toBe(false); // reversão
    expect(store.canTransition(card.id, 'IN_PROGRESS')).toBe(false); // mesmo status não é adiante
  });

  it('moveCard atualiza coluna/status e reposiciona os cartões da coluna', () => {
    const store = createKanbanStore();
    const c1 = store.addCard({ title: 'A', columnId: 'todo' });
    const c2 = store.addCard({ title: 'B', columnId: 'todo' }); // position 1

    const result = ok(store.moveCard(c1.id, 'done', 0) as { ok: true; card: Card });
    expect(result.status).toBe('DONE');
    expect(result.columnId).toBe('done');
    expect(result.position).toBe(0);

    const todo = store.cards.filter((c) => c.columnId === 'todo');
    expect(todo.map((c) => c.id)).toEqual([c2.id]);
    expect(todo[0].position).toBe(0); // posições compactadas após a saída
  });

  it('deleteCard remove o cartão e retorna false para id inexistente', () => {
    const store = createKanbanStore();
    const card = store.addCard({ title: 'C1', columnId: 'todo' });

    expect(store.deleteCard(card.id)).toBe(true);
    expect(store.cards).toEqual([]);
    expect(store.deleteCard(card.id)).toBe(false);
  });

  it('hidrata do localStorage ao criar uma nova instância (reload)', () => {
    const store1 = createKanbanStore();
    const card = store1.addCard({ title: 'C1', columnId: 'todo' });
    const moved = ok(store1.moveNext(card.id) as { ok: true; card: Card });

    const store2 = createKanbanStore();
    const hydrated = store2.cards.find((c) => c.id === card.id);
    expect(hydrated?.status).toBe('IN_PROGRESS');
    expect(hydrated?.columnId).toBe('in-progress');
    expect(hydrated?.updatedAt).toBe(moved.updatedAt);
  });

  it('ignora localStorage malformado em vez de falhar', () => {
    localStorage.setItem(STORAGE_KEY, 'não é json');
    const store = createKanbanStore();
    expect(store.cards).toEqual([]);

    const card = store.addCard({ title: 'C1', columnId: 'todo' });
    expect(card.id).toBeDefined();
  });

  it('ordena os cartões de cada coluna por posição', () => {
    const store = createKanbanStore();
    const c1 = store.addCard({ title: 'A', columnId: 'todo' });
    const c2 = store.addCard({ title: 'B', columnId: 'todo' });

    const todo = store.cards.filter((c) => c.columnId === 'todo');
    expect(todo.map((c) => c.id)).toEqual([c1.id, c2.id]);
    expect(todo[0].position).toBe(0);
    expect(todo[1].position).toBe(1);
  });

  it('subscribe avisa ouvintes em cada mudança e para após unsubscribe', () => {
    const store = createKanbanStore();
    const calls: string[] = [];
    const unsub = store.subscribe(() => calls.push('change'));

    store.addCard({ title: 'C1', columnId: 'todo' });
    expect(calls).toEqual(['change']);

    unsub();
    store.addCard({ title: 'C2', columnId: 'todo' });
    expect(calls).toEqual(['change']);
  });

  it('moveCard rejeita saltos de etapa e reversões do ciclo de vida', () => {
    const store = createKanbanStore();
    const todoCard = store.addCard({ title: 'A', columnId: 'todo' });
    const doneCard = store.addCard({ title: 'B', columnId: 'done' });

    const skip = store.moveCard(todoCard.id, 'testing', 0) as {
      ok: false;
      error: string;
    };
    expect(skip.ok).toBe(false);
    expect(skip.error).toContain('Invalid transition');

    const rollback = store.moveCard(doneCard.id, 'todo', 0) as {
      ok: false;
      error: string;
    };
    expect(rollback.ok).toBe(false);
    expect(rollback.error).toContain('Invalid transition');

    // Estado inalterado após as rejeições.
    expect(store.cards.find((c) => c.id === todoCard.id)?.status).toBe('TODO');
    expect(store.cards.find((c) => c.id === doneCard.id)?.status).toBe('DONE');
  });

  it('moveCard avança um estágio e aceita reposicionamento dentro da mesma coluna', () => {
    const store = createKanbanStore();
    const c1 = store.addCard({ title: 'A', columnId: 'todo' });
    const c2 = store.addCard({ title: 'B', columnId: 'todo' });

    const advanced = ok(store.moveCard(c1.id, 'in-progress', 0) as { ok: true; card: Card });
    expect(advanced.status).toBe('IN_PROGRESS');
    expect(advanced.columnId).toBe('in-progress');

    const reordered = ok(store.moveCard(c2.id, 'todo', 0) as { ok: true; card: Card });
    expect(reordered.status).toBe('TODO');
    const todo = store.cards.filter((c) => c.columnId === 'todo');
    expect(todo.map((c) => c.id)).toEqual([c2.id]);
    expect(todo[0].position).toBe(0);
  });

  it('subscribe recebe CardMovedEvent com cardId, from, to, position e at', () => {
    const store = createKanbanStore();
    const events: CardMovedEvent[] = [];
    store.subscribe((event) => {
      if (event) events.push(event);
    });

    const card = store.addCard({ title: 'C1', columnId: 'todo' });
    store.moveNext(card.id); // TODO → IN_PROGRESS
    store.moveNext(card.id); // IN_PROGRESS → TESTING

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      cardId: card.id,
      from: 'todo',
      to: 'in-progress',
      position: 0,
    });
    expect(events[1]).toMatchObject({
      cardId: card.id,
      from: 'in-progress',
      to: 'testing',
      position: 0,
    });
    for (const event of events) {
      expect(event.at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });
});
