import { describe, it, expect } from 'vitest'
import { scheduleNext, isDue, INTERVALS_DAYS, MAX_BOX } from '../lib/schedule'

const now = new Date('2024-01-15T10:00:00Z')

describe('scheduleNext (Leitner)', () => {
  it('intervalos por caixa são [0, 1, 3, 7, 14, 30]', () => {
    expect(INTERVALS_DAYS).toEqual([0, 1, 3, 7, 14, 30])
  })

  it('caixa máxima é 5', () => {
    expect(MAX_BOX).toBe(5)
  })

  it('acertar na caixa 0 avança para caixa 1 com due em +1 dia', () => {
    const result = scheduleNext({ box: 0, correct: true, reviewCount: 0, now })
    expect(result.box).toBe(1)
    expect(result.reviewCount).toBe(1)
    expect(result.mastered).toBe(false)

    const due = new Date(result.dueAt)
    const expected = new Date(now.getTime())
    expected.setDate(expected.getDate() + INTERVALS_DAYS[1]) // +1 dia
    expect(due.getTime()).toBe(expected.getTime())
  })

  it('acertar na caixa 4 avança para caixa 5 e fica dominado', () => {
    const result = scheduleNext({ box: 4, correct: true, reviewCount: 2, now })
    expect(result.box).toBe(5)
    expect(result.reviewCount).toBe(3)
    expect(result.mastered).toBe(true)

    const due = new Date(result.dueAt)
    const expected = new Date(now.getTime())
    expected.setDate(expected.getDate() + INTERVALS_DAYS[5]) // +30 dias
    expect(due.getTime()).toBe(expected.getTime())
  })

  it('acertar na caixa 5 fica na caixa 5 (não ultrapassa o máximo)', () => {
    const result = scheduleNext({ box: 5, correct: true, reviewCount: 0, now })
    expect(result.box).toBe(5)
    expect(result.mastered).toBe(true)
  })

  it('errar zera a caixa e define due_at para agora', () => {
    const result = scheduleNext({ box: 3, correct: false, reviewCount: 1, now })
    expect(result.box).toBe(0)
    expect(result.reviewCount).toBe(2)
    expect(result.mastered).toBe(false)

    const due = new Date(result.dueAt)
    expect(due.getTime()).toBe(now.getTime())
  })

  it('review_count incrementa a cada resposta', () => {
    let result = scheduleNext({ box: 0, correct: true, reviewCount: 0, now })
    expect(result.reviewCount).toBe(1)

    result = scheduleNext({ box: result.box, correct: false, reviewCount: result.reviewCount, now })
    expect(result.reviewCount).toBe(2)
  })
})

describe('isDue', () => {
  it('retorna true quando due_at é hoje', () => {
    const today = new Date('2024-01-15T10:00:00Z')
    expect(isDue(today.toISOString(), today)).toBe(true)
  })

  it('retorna false quando due_at é amanhã', () => {
    const today = new Date('2024-01-15T10:00:00Z')
    const tomorrow = new Date(today.getTime())
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(isDue(tomorrow.toISOString(), today)).toBe(false)
  })

  it('retorna true quando due_at já passou', () => {
    const today = new Date('2024-01-15T10:00:00Z')
    const yesterday = new Date(today.getTime())
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isDue(yesterday.toISOString(), today)).toBe(true)
  })
})
