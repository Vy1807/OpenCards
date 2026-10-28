import { describe, it, expect } from 'vitest';
import { scheduleNext, isDue, INTERVALS_DAYS, MAX_BOX } from './schedule';

describe('scheduleNext (Leitner)', () => {
  const now = new Date('2026-01-10T10:00:00Z');

  it('expõe os intervalos Leitner [0, 1, 3, 7, 14, 30] e o teto da caixa 5', () => {
    expect(INTERVALS_DAYS).toEqual([0, 1, 3, 7, 14, 30]);
    expect(MAX_BOX).toBe(5);
  });

  it('resposta correta avança a caixa e agenda pelo intervalo da nova caixa', () => {
    const result = scheduleNext({ box: 0, correct: true, reviewCount: 0, now });

    expect(result.box).toBe(1);
    expect(result.reviewCount).toBe(1);
    expect(result.mastered).toBe(false);

    const expected = new Date(now.getTime());
    expected.setDate(expected.getDate() + INTERVALS_DAYS[1]); // +1 dia
    expect(new Date(result.dueAt).getTime()).toBe(expected.getTime());
  });

  it('limita a caixa em 5 e considera mastered a partir da caixa 4', () => {
    const r4 = scheduleNext({ box: 4, correct: true, reviewCount: 0, now });
    expect(r4.box).toBe(5);
    expect(r4.mastered).toBe(true);

    const r5 = scheduleNext({ box: 5, correct: true, reviewCount: 0, now });
    expect(r5.box).toBe(5);
  });

  it('resposta incorreta reseta a caixa para 0 e agenda para agora', () => {
    const result = scheduleNext({ box: 3, correct: false, reviewCount: 2, now });

    expect(result.box).toBe(0);
    expect(result.reviewCount).toBe(3);
    expect(result.mastered).toBe(false);
    expect(new Date(result.dueAt).getTime()).toBe(now.getTime());
  });

  it('increments review_count em toda resposta', () => {
    const first = scheduleNext({ box: 0, correct: true, reviewCount: 0, now });
    const second = scheduleNext({
      box: first.box,
      correct: true,
      reviewCount: first.reviewCount,
      now,
    });
    expect(second.reviewCount).toBe(2);
  });

  it('usa o intervalo de cada caixa ao avançar sucessivamente', () => {
    let result = scheduleNext({ box: 0, correct: true, reviewCount: 0, now });
    for (let i = 1; i < 5; i++) {
      result = scheduleNext({
        box: result.box,
        correct: true,
        reviewCount: result.reviewCount,
        now,
      });
    }
    expect(result.box).toBe(5);
    expect(result.mastered).toBe(true);
  });
});

describe('isDue', () => {
  const now = new Date('2026-01-10T10:00:00Z');

  it('retorna true quando o vencimento já passou', () => {
    expect(isDue('2026-01-09T10:00:00Z', now)).toBe(true);
  });

  it('retorna false quando o vencimento está no futuro', () => {
    expect(isDue('2026-01-11T10:00:00Z', now)).toBe(false);
  });

  it('usa agora por padrão quando não recebe referência', () => {
    expect(isDue('2020-01-01T00:00:00Z')).toBe(true);
  });
});
