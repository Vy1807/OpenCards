import { describe, it, expect } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('retorna array vazio quando entrada é vazia', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('retorna array com 1 item inalterado', () => {
    expect(shuffle([1])).toEqual([1]);
    expect(shuffle(['a'])).toEqual(['a']);
  });

  it('não modifica o array original (imutabilidade)', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    const result = shuffle(original);
    expect(result).not.toBe(original);
    expect(original).toEqual(copy);
  });

  it('preserva todos os elementos (mesmo comprimento, mesmos itens)', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = shuffle(items);
    expect(result.length).toBe(items.length);
    expect(result.sort()).toEqual(items.sort());
  });

  it('embaralha arrays grandes (distribuição uniforme — não retorna igual)', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const result = shuffle(items);
    // Probabilidade de ficar igual é 1/100! — praticamente zero
    expect(result).not.toEqual(items);
  });

  it('funciona com strings', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const result = shuffle(items);
    expect(result.length).toBe(5);
    expect(result.sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('funciona com objetos', () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' },
    ];
    const result = shuffle(items);
    expect(result.length).toBe(3);
    expect(result.map((i) => i.id).sort()).toEqual([1, 2, 3]);
  });
});
