import { describe, it, expect } from 'vitest'
import { exportCards, exportCardsJson } from '../lib/exportCards'
import { parseAndValidateImport } from '../lib/importCards'

describe('exportCards', () => {
  it('converte cartões no formato de exportação', () => {
    const cards = [
      { card_code: 'CARD-001', front_text: 'Pergunta 1?', back_text: 'Resposta 1' },
      { card_code: 'CARD-002', front_text: 'Pergunta 2?', back_text: 'Resposta 2' },
    ];

    const result = exportCards(cards);
    expect(result).toEqual([
      { id: 'CARD-001', question: 'Pergunta 1?', answer: 'Resposta 1' },
      { id: 'CARD-002', question: 'Pergunta 2?', answer: 'Resposta 2' },
    ]);
  })

  it('exportCardsJson produz JSON válido', () => {
    const cards = [{ card_code: '1', front_text: 'Q?', back_text: 'A' }];
    const json = exportCardsJson(cards);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual([{ id: '1', question: 'Q?', answer: 'A' }]);
  })

  it('round-trip: exportar e importar não altera nada', () => {
    const cards = [
      { card_code: 'CARD-001', front_text: 'Qual é a capital da França?', back_text: 'Paris' },
      { card_code: 'CARD-002', front_text: 'Quanto é 2+2?', back_text: '4' },
    ];

    const exported = exportCards(cards);
    const json = JSON.stringify(exported);
    const { valid, invalid } = parseAndValidateImport(json);

    expect(invalid).toEqual([]);
    expect(valid).toEqual([
      { id: 'CARD-001', question: 'Qual é a capital da França?', answer: 'Paris' },
      { id: 'CARD-002', question: 'Quanto é 2+2?', answer: '4' },
    ]);
  })
})
