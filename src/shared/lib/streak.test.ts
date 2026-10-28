import { describe, it, expect } from 'vitest';
import { streak } from './streak';

describe('streak', () => {
  it('retorna 0 para array vazio', () => {
    expect(streak([])).toBe(0);
  });

  it('conta dias consecutivos a partir de hoje', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const dates = [
      today.toISOString(),
      yesterday.toISOString(),
      twoDaysAgo.toISOString(),
    ];

    expect(streak(dates, today)).toBe(3);
  });

  it('gap quebra o streak', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3); // gap de 1 dia

    const dates = [
      today.toISOString(),
      yesterday.toISOString(),
      threeDaysAgo.toISOString(),
    ];

    expect(streak(dates, today)).toBe(2); // hoje + ontem = 2, gap quebra
  });

  it('hoje conta se houver revisão hoje', () => {
    const today = new Date();
    expect(streak([today.toISOString()], today)).toBe(1);
  });

  it('timezone: usa data local para comparação', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Datas em timezone diferente mas mesmo dia local
    const dates = [
      new Date(today.getTime() + 3600000).toISOString(), // +1h
      new Date(yesterday.getTime() - 3600000).toISOString(), // -1h
    ];

    expect(streak(dates, today)).toBe(2);
  });

  it('streak([]) === 0', () => {
    expect(streak([])).toBe(0);
  });

  it('ignora revisões futuras', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    expect(streak([tomorrow.toISOString()], today)).toBe(0);
  });

  it('múltiplas revisões no mesmo dia contam como 1', () => {
    const today = new Date();
    const morning = new Date(today);
    morning.setHours(8, 0, 0, 0);
    const evening = new Date(today);
    evening.setHours(20, 0, 0, 0);

    expect(streak([morning.toISOString(), evening.toISOString()], today)).toBe(1);
  });
});