import { describe, it, expect } from 'vitest';
import { exportCards, exportCardsJson } from './exportCards';
import { parseAndValidateImport } from './importCards';

describe('exportCards', () => {
  it('exporta array vazio', () => {
    expect(exportCards([])).toEqual([]);
  });

  it('exporta N cards convertendo card_code->id, front_text->question, back_text->answer', () => {
    const cards = [
      { card_code: '1', front_text: 'Pergunta 1', back_text: 'Resposta 1' },
      { card_code: '2', front_text: 'Pergunta 2', back_text: 'Resposta 2' },
      { card_code: '3', front_text: 'Pergunta 3', back_text: 'Resposta 3' },
    ];

    const result = exportCards(cards);

    expect(result).toEqual([
      { id: '1', question: 'Pergunta 1', answer: 'Resposta 1' },
      { id: '2', question: 'Pergunta 2', answer: 'Resposta 2' },
      { id: '3', question: 'Pergunta 3', answer: 'Resposta 3' },
    ]);
  });

  it('exportCardsJson stringifica com indentação bonita', () => {
    const cards = [{ card_code: '1', front_text: 'Q', back_text: 'A' }];
    const json = exportCardsJson(cards);
    const parsed = JSON.parse(json);

    expect(parsed).toEqual([{ id: '1', question: 'Q', answer: 'A' }]);
    expect(json).toContain('\n  ');
  });

  it('round-trip export -> import preserva dados', () => {
    const originalCards = [
      { card_code: 'CARD-001', front_text: 'O que é X?', back_text: 'Y' },
      { card_code: 'CARD-002', front_text: '2+2?', back_text: '4' },
    ];

    const exported = exportCards(originalCards);
    const json = JSON.stringify(exported);
    const imported = parseAndValidateImport(json);

    expect(imported.valid).toHaveLength(2);
    expect(imported.invalid).toHaveLength(0);
    expect(imported.valid[0]).toEqual({ id: 'CARD-001', question: 'O que é X?', answer: 'Y' });
    expect(imported.valid[1]).toEqual({ id: 'CARD-002', question: '2+2?', answer: '4' });
  });

  it('round-trip com cards vazios', () => {
    const exported = exportCards([]);
    const json = JSON.stringify(exported);
    const imported = parseAndValidateImport(json);

    expect(imported.valid).toHaveLength(0);
    expect(imported.invalid).toHaveLength(0);
  });
});