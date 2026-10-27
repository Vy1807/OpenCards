/**
 * streak.ts — cálculo de sequência de dias estudados a partir do review_log.
 *
 * A sequência é o número de dias consecutivos (contando de trás para frente
 * a partir de hoje) em que o usuário teve pelo menos uma revisão registrada.
 */
export function streak(reviewedAtDates: string[], now: Date = new Date()): number {
  if (reviewedAtDates.length === 0) return 0

  // Agrupa as revisões por dia (YYYY-MM-DD)
  const studiedDays = new Set(
    reviewedAtDates.map((d) => {
      const date = new Date(d)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }),
  )

  let count = 0
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  while (true) {
    const dayKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
    if (studiedDays.has(dayKey)) {
      count += 1
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return count
}
