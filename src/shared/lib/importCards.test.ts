import { describe, it, expect } from 'vitest';
import { parseAndValidateImport } from './importCards';

describe('parseAndValidateImport', () => {
  it('aceita um array válido de cartões e retorna os itens normalizados', () => {
    const result = parseAndValidateImport(
      JSON.stringify([
        { id: 'CARD-001', question: 'Qual é a capital?', answer: 'Brasília' },
        { id: 'CARD-002', question: '2 + 2?', answer: '4' },
      ])
    );

    expect(result.valid).toEqual([
      { id: 'CARD-001', question: 'Qual é a capital?', answer: 'Brasília' },
      { id: 'CARD-002', question: '2 + 2?', answer: '4' },
    ]);
    expect(result.invalid).toHaveLength(0);
  });

  it('rejeita JSON inválido', () => {
    const result = parseAndValidateImport('não é json');

    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].reason).toBe('JSON inválido');
  });

  it('rejeita conteúdo que não é um array', () => {
    const result = parseAndValidateImport(JSON.stringify({ id: '1', question: 'q', answer: 'a' }));

    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].reason).toBe('O conteúdo deve ser um array');
  });

  it('rejeita itens sem campos obrigatórios', () => {
    const result = parseAndValidateImport(
      JSON.stringify([
        { id: '', question: 'q', answer: 'a' },
        { id: '2', question: '', answer: 'a' },
        { id: '3', question: 'q', answer: '' },
      ])
    );

    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(3);
  });

  it('rejeita ids duplicados dentro do arquivo', () => {
    const result = parseAndValidateImport(
      JSON.stringify([
        { id: 'DUP', question: 'q1', answer: 'a1' },
        { id: 'DUP', question: 'q2', answer: 'a2' },
      ])
    );

    expect(result.valid).toHaveLength(1);
    expect(result.valid[0].id).toBe('DUP');
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].reason).toContain('duplicado');
  });
});
