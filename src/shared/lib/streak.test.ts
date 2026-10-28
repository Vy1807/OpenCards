import { describe, it, expect } from 'vitest';
import { streak, formatStreak } from './streak';

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

describe('formatStreak', () => {
  it('retorna "Hoje você já revisou" para 0 dias', () => {
    expect(formatStreak(0)).toBe('Hoje você já revisou');
  });

  it('retorna "1 dia desde sua última revisão" para 1 dia', () => {
    expect(formatStreak(1)).toBe('1 dia desde sua última revisão');
  });

  it('retorna "N dias desde sua última revisão" para N > 1', () => {
    expect(formatStreak(2)).toBe('2 dias desde sua última revisão');
    expect(formatStreak(5)).toBe('5 dias desde sua última revisão');
    expect(formatStreak(10)).toBe('10 dias desde sua última revisão');
  });
});