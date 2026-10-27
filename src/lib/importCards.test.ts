import { describe, it, expect } from 'vitest'
import { parseAndValidateImport } from '../lib/importCards'

describe('parseAndValidateImport', () => {
  it('accepts valid cards', () => {
    const input = JSON.stringify([
      { id: 'c1', question: 'Q1', answer: 'A1' },
      { id: 'c2', question: 'Q2', answer: 'A2' },
    ])
    const { valid, invalid } = parseAndValidateImport(input)
    expect(valid).toEqual([
      { id: 'c1', question: 'Q1', answer: 'A1' },
      { id: 'c2', question: 'Q2', answer: 'A2' },
    ])
    expect(invalid).toEqual([])
  })

  it('rejects non-array JSON', () => {
    const { valid, invalid } = parseAndValidateImport('{"id": "c1"}')
    expect(valid).toEqual([])
    expect(invalid).toHaveLength(1)
    expect(invalid[0].reason).toContain('array')
  })

  it('rejects invalid JSON', () => {
    const { valid, invalid } = parseAndValidateImport('not json')
    expect(valid).toEqual([])
    expect(invalid).toHaveLength(1)
    expect(invalid[0].reason).toContain('inválido')
  })

  it('rejects missing fields', () => {
    const input = JSON.stringify([
      { id: 'c1', question: 'Q1' }, // missing answer
      { id: 'c2', answer: 'A2' }, // missing question
      { question: 'Q3', answer: 'A3' }, // missing id
    ])
    const { valid, invalid } = parseAndValidateImport(input)
    expect(valid).toEqual([])
    expect(invalid).toHaveLength(3)
    expect(invalid[0].reason).toContain('answer')
    expect(invalid[1].reason).toContain('question')
    expect(invalid[2].reason).toContain('id')
  })

  it('rejects empty strings', () => {
    const input = JSON.stringify([
      { id: '  ', question: 'Q', answer: 'A' },
      { id: 'c1', question: '', answer: 'A' },
      { id: 'c2', question: 'Q', answer: '   ' },
    ])
    const { valid, invalid } = parseAndValidateImport(input)
    expect(valid).toEqual([])
    expect(invalid).toHaveLength(3)
  })

  it('rejects duplicate ids within the file', () => {
    const input = JSON.stringify([
      { id: 'c1', question: 'Q1', answer: 'A1' },
      { id: 'c1', question: 'Q2', answer: 'A2' },
    ])
    const { valid, invalid } = parseAndValidateImport(input)
    expect(valid).toHaveLength(1)
    expect(invalid).toHaveLength(1)
    expect(invalid[0].reason).toContain('duplicado')
    expect(invalid[0].index).toBe(1)
  })

  it('reports index and reason for invalid items', () => {
    const input = JSON.stringify([
      { id: 'c1', question: 'Q1', answer: 'A1' },
      { id: '', question: 'Q2', answer: 'A2' },
    ])
    const { invalid } = parseAndValidateImport(input)
    expect(invalid).toHaveLength(1)
    expect(invalid[0].index).toBe(1)
    expect(invalid[0].reason).toContain('id')
  })
})
