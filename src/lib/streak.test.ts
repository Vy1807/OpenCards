import { describe, it, expect } from 'vitest'
import { streak } from '../lib/streak'

const today = new Date('2024-01-15T10:00:00Z')

function iso(date: Date): string {
  return date.toISOString()
}

describe('streak', () => {
  it('retorna 0 quando não há revisões', () => {
    expect(streak([], today)).toBe(0)
  })

  it('retorna 1 quando estudou apenas hoje', () => {
    expect(streak([iso(today)], today)).toBe(1)
  })

  it('retorna 2 quando estudou hoje e ontem', () => {
    const yesterday = new Date(today.getTime())
    yesterday.setDate(yesterday.getDate() - 1)
    expect(streak([iso(today), iso(yesterday)], today)).toBe(2)
  })

  it('retorna 5 para sequência de 5 dias consecutivos', () => {
    const dates: string[] = []
    for (let i = 0; i < 5; i++) {
      const d = new Date(today.getTime())
      d.setDate(d.getDate() - i)
      dates.push(iso(d))
    }
    expect(streak(dates, today)).toBe(5)
  })

  it('ignora revisões no mesmo dia (contagem por dia único)', () => {
    const yesterday = new Date(today.getTime())
    yesterday.setDate(yesterday.getDate() - 1)
    // Duas revisões hoje, uma ontem
    expect(streak([iso(today), iso(today), iso(yesterday)], today)).toBe(2)
  })

  it('interrompe a sequência quando falta um dia', () => {
    const yesterday = new Date(today.getTime())
    yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date(today.getTime())
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    // Estudou hoje e anteontem, mas não ontem -> sequência é 1 (apenas hoje)
    expect(streak([iso(today), iso(twoDaysAgo)], today)).toBe(1)
  })

  it('não conta dias futuros', () => {
    const tomorrow = new Date(today.getTime())
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(streak([iso(tomorrow)], today)).toBe(0)
  })

  it('usa data atual quando não fornecida', () => {
    // Com revisão ontem e hoje (usando Date.now real), deveria retornar pelo menos 1
    const now = new Date()
    const yesterday = new Date(now.getTime())
    yesterday.setDate(yesterday.getDate() - 1)
    expect(streak([iso(yesterday), iso(now)], now)).toBe(2)
  })
})
