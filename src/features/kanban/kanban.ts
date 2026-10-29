/**
 * OpenCards — Kanban domain types.
 *
 * Card lifecycle: TO DO -> IN PROGRESS -> TESTING -> DONE (forward one step only).
 */

export type CardStatus = 'TODO' | 'IN_PROGRESS' | 'TESTING' | 'DONE';

export const CARD_STATUSES: CardStatus[] = ['TODO', 'IN_PROGRESS', 'TESTING', 'DONE'];

export const STATUS_LABELS: Record<CardStatus, string> = {
  TODO: 'TO DO',
  IN_PROGRESS: 'IN PROGRESS',
  TESTING: 'TESTING',
  DONE: 'DONE',
};

/**
 * Pill colors per status (UI/UX spec, sections 3.3 and 4.1).
 * Usa variáveis CSS de papel de cor (--role-*) para respeitar o tema ativo.
 * Nenhum hex solto em componente.
 */
export const STATUS_COLORS: Record<CardStatus, string> = {
  TODO: '--role-texto-suave',
  IN_PROGRESS: '--role-acao-principal',
  TESTING: '--role-aviso',
  DONE: '--role-sucesso',
};

export type ColumnId = 'todo' | 'in-progress' | 'testing' | 'done';

export const COLUMN_ORDER: ColumnId[] = ['todo', 'in-progress', 'testing', 'done'];

export const COLUMN_TITLES: Record<ColumnId, string> = {
  todo: 'TO DO',
  'in-progress': 'IN PROGRESS',
  testing: 'TESTING',
  done: 'DONE',
};

export const STATUS_TO_COLUMN: Record<CardStatus, ColumnId> = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  TESTING: 'testing',
  DONE: 'done',
};

export interface Card {
  id: string;
  title: string;
  status: CardStatus;
  columnId: ColumnId;
  position: number;
  updatedAt: string;
  category?: string;
}

export interface Column {
  id: ColumnId;
  title: string;
}

export interface CardMovedEvent {
  cardId: string;
  /** Coluna de origem do movimento. */
  from: ColumnId;
  /** Coluna de destino do movimento. */
  to: ColumnId;
  /** Nova posição do cartão dentro da coluna destino. */
  position: number;
  /** Momento do movimento (ISO 8601). */
  at: string;
  /** Ator que iniciou o movimento (preenchido pela camada de UI quando conhecido). */
  by?: string;
}

export function defaultColumns(): Column[] {
  return COLUMN_ORDER.map((id) => ({ id, title: COLUMN_TITLES[id] }));
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function nextId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
