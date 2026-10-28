/**
 * OpenCards — Kanban autonomous store.
 *
 * Holds cards/columns in memory, persists cards to localStorage
 * (key `opencards:kanban:cards`) so state survives reload, and validates the
 * one-step-forward lifecycle (TO DO -> IN PROGRESS -> TESTING -> DONE).
 */

import {
  type Card,
  type CardStatus,
  type CardMovedEvent,
  type Column,
  type ColumnId,
  defaultColumns,
  nowISO,
  nextId,
  STATUS_TO_COLUMN,
} from './kanban';

const STORAGE_KEY = 'opencards:kanban:cards';

const COLUMN_ID_TO_STATUS: Record<ColumnId, CardStatus> = {
  todo: 'TODO',
  'in-progress': 'IN_PROGRESS',
  testing: 'TESTING',
  done: 'DONE',
};

const ALLOWED: Record<CardStatus, CardStatus[]> = {
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['TESTING'],
  TESTING: ['DONE'],
  DONE: [],
};

export function canTransition(status: CardStatus, to: CardStatus): boolean {
  return (ALLOWED[status] ?? []).includes(to);
}

export function getAllowedTransitions(status: CardStatus): CardStatus[] {
  return [...(ALLOWED[status] ?? [])];
}

export interface KanbanStore {
  readonly cards: Card[];
  readonly columns: Column[];
  addCard: (data: { title: string; columnId: ColumnId; category?: string }) => Card;
  moveCard: (
    cardId: string,
    toColumnId: ColumnId,
    position: number
  ) => { ok: true; card: Card } | { ok: false; error: string };
  moveNext: (cardId: string) => { ok: true; card: Card } | { ok: false; error: string };
  canTransition: (cardId: string, to: CardStatus) => boolean;
  deleteCard: (cardId: string) => boolean;
  subscribe: (listener: (event?: CardMovedEvent) => void) => () => void;
  destroy: () => void;
}

function readStoredCards(): Card[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Card[];
    return null;
  } catch {
    return null;
  }
}

function writeStoredCards(cards: Card[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // localStorage may be unavailable/quota-exceeded; keep working in memory.
  }
}

export function createKanbanStore({
  cards: initialCards = [],
  columns: initialColumns,
}: { cards?: Card[]; columns?: Column[] } = {}): KanbanStore {
  let currentCards = readStoredCards() ?? initialCards;
  const currentColumns = initialColumns ?? defaultColumns();
  const listeners = new Set<(event?: CardMovedEvent) => void>();

  const notify = (event?: CardMovedEvent) => {
    for (const listener of [...listeners]) listener(event);
  };

  const persist = (event?: CardMovedEvent) => {
    writeStoredCards(currentCards);
    notify(event);
  };

  const findCard = (cardId: string): Card | undefined => currentCards.find((c) => c.id === cardId);

  const cardsIn = (columnId: ColumnId): Card[] =>
    currentCards.filter((c) => c.columnId === columnId).sort((a, b) => a.position - b.position);

  const moveCard = (
    cardId: string,
    toColumnId: ColumnId,
    position: number
  ): { ok: true; card: Card } | { ok: false; error: string } => {
    const card = findCard(cardId);
    if (!card) {
      return { ok: false, error: 'Card not found' };
    }
    if (!currentColumns.some((c) => c.id === toColumnId)) {
      return { ok: false, error: 'Target column not found' };
    }
    const targetStatus = COLUMN_ID_TO_STATUS[toColumnId];
    // Ciclo de vida autônomo: avança um estágio por vez
    // (TODO → IN_PROGRESS → TESTING → DONE). Saltos e reversões são
    // rejeitados; reposicionamento dentro da mesma coluna (mesmo status) é
    // permitido.
    if (targetStatus !== card.status && !canTransition(card.status, targetStatus)) {
      return {
        ok: false,
        error: `Invalid transition from ${card.status} to ${targetStatus}: advance one stage at a time (TODO → IN_PROGRESS → TESTING → DONE).`,
      };
    }
    const targetCount = currentCards.filter(
      (c) => c.columnId === toColumnId && c.id !== cardId
    ).length;
    const pos = Math.min(Math.max(position, 0), targetCount);
    const updated: Card = {
      ...card,
      columnId: toColumnId,
      status: targetStatus,
      position: pos,
      updatedAt: nowISO(),
    };

    const without = currentCards.filter((c) => c.id !== cardId);
    without.push(updated);

    const grouped = new Map<ColumnId, Card[]>();
    currentColumns.forEach((c) => grouped.set(c.id, []));
    without.forEach((c) => {
      const arr = grouped.get(c.columnId);
      if (arr) arr.push(c);
    });

    const next: Card[] = [];
    currentColumns.forEach((col) => {
      const arr = (grouped.get(col.id) ?? []).sort((a, b) => a.position - b.position);
      arr.forEach((c, i) => next.push({ ...c, columnId: col.id, position: i }));
    });

    currentCards = next;
    const event: CardMovedEvent | undefined =
      toColumnId !== card.columnId || pos !== card.position
        ? { cardId, from: card.columnId, to: toColumnId, position: pos, at: nowISO() }
        : undefined;
    persist(event);
    return { ok: true, card: { ...updated, position: pos } };
  };

  const moveNext = (cardId: string): { ok: true; card: Card } | { ok: false; error: string } => {
    const card = findCard(cardId);
    if (!card) {
      return { ok: false, error: 'Card not found' };
    }
    const allowed = getAllowedTransitions(card.status);
    if (allowed.length === 0) {
      return { ok: false, error: 'No further transition allowed' };
    }
    const to = allowed[0];
    return moveCard(cardId, STATUS_TO_COLUMN[to], cardsIn(STATUS_TO_COLUMN[to]).length);
  };

  return {
    get cards() {
      return currentCards;
    },
    get columns() {
      return currentColumns;
    },
    addCard({ title, columnId, category }) {
      const status = COLUMN_ID_TO_STATUS[columnId];
      const card: Card = {
        id: nextId(),
        title: title.trim(),
        status,
        columnId,
        position: cardsIn(columnId).length,
        updatedAt: nowISO(),
        category,
      };
      currentCards = [...currentCards, card];
      persist();
      return card;
    },
    moveCard,
    moveNext,
    canTransition(cardId, to) {
      const card = findCard(cardId);
      if (!card) return false;
      return canTransition(card.status, to);
    },
    deleteCard(cardId) {
      const exists = currentCards.some((c) => c.id === cardId);
      if (!exists) return false;
      currentCards = currentCards.filter((c) => c.id !== cardId);
      persist();
      return true;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      listeners.clear();
    },
  };
}
