import { describe, expect, it } from 'vitest';

import {
  type CardStatus,
  CARD_STATUSES,
  COLUMN_ORDER,
  COLUMN_TITLES,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_TO_COLUMN,
  defaultColumns,
  nowISO,
  nextId,
} from './kanban';

const STATUSES: CardStatus[] = ['TODO', 'IN_PROGRESS', 'TESTING', 'DONE'];

describe('kanban domain', () => {
  it('CARD_STATUSES segue a ordem do ciclo de vida', () => {
    expect(CARD_STATUSES).toEqual(STATUSES);
  });

  it('STATUS_TO_COLUMN, STATUS_LABELS e STATUS_COLORS cobrem todos os status', () => {
    for (const status of STATUSES) {
      expect(STATUS_TO_COLUMN[status]).toBeDefined();
      expect(STATUS_LABELS[status]).toBeDefined();
      expect(STATUS_COLORS[status]).toBeDefined();
    }
  });

  it('STATUS_TO_COLUMN bate com as definições de coluna', () => {
    expect(STATUS_TO_COLUMN.TODO).toBe('todo');
    expect(STATUS_TO_COLUMN.IN_PROGRESS).toBe('in-progress');
    expect(STATUS_TO_COLUMN.TESTING).toBe('testing');
    expect(STATUS_TO_COLUMN.DONE).toBe('done');
  });

  it('defaultColumns retorna as quatro colunas na ordem do quadro', () => {
    const columns = defaultColumns();
    expect(columns).toHaveLength(4);
    expect(columns.map((c) => c.id)).toEqual(COLUMN_ORDER);
    expect(columns.map((c) => c.title)).toEqual(
      COLUMN_ORDER.map((id) => COLUMN_TITLES[id])
    );
  });

  it('nowISO retorna uma string ISO 8601', () => {
    expect(nowISO()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(nowISO()).toISOString()).toBe(nowISO());
  });

  it('nextId gera ids únicos no formato timestamp-sufixo', () => {
    const a = nextId();
    const b = nextId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^\d+-[a-z0-9]{7}$/);
    expect(b).toMatch(/^\d+-[a-z0-9]{7}$/);
  });
});
