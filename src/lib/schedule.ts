const INTERVALS_DAYS = [0, 1, 3, 7, 14, 30]
const MAX_BOX = 5

export type ScheduleResult = {
  box: number
  dueAt: string
  reviewCount: number
  lastReviewedAt: string
  mastered: boolean
}

/**
 * scheduleNext — função pura de repetição espaçada (Leitner).
 *
 * Regras:
 * - Acertou: box = min(box + 1, 5); due_at = agora + intervalo[nova caixa] dias
 * - Errou:   box = 0; due_at = agora
 * - "Dominado" = box >= 4
 * - review_count incrementa em 1 a cada resposta
 */
export function scheduleNext({
  box = 0,
  correct,
  reviewCount = 0,
  now,
}: {
  box?: number
  correct: boolean
  reviewCount?: number
  now: Date
}): ScheduleResult {
  let newBox: number
  let dueAt: Date

  if (correct) {
    newBox = Math.min(box + 1, MAX_BOX)
    dueAt = new Date(now.getTime())
    dueAt.setDate(dueAt.getDate() + INTERVALS_DAYS[newBox])
  } else {
    newBox = 0
    dueAt = new Date(now.getTime())
  }

  const newReviewCount = reviewCount + 1
  const mastered = newBox >= 4

  return {
    box: newBox,
    dueAt: dueAt.toISOString(),
    reviewCount: newReviewCount,
    lastReviewedAt: now.toISOString(),
    mastered,
  }
}

export function isDue(dueAt: string | Date, now: Date = new Date()): boolean {
  const due = typeof dueAt === 'string' ? new Date(dueAt) : dueAt
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return due.getTime() <= todayEnd.getTime()
}

export { INTERVALS_DAYS, MAX_BOX }
