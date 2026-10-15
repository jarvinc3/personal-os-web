/**
 * Credit-card display helpers. The backend owns the projected cycle
 * (`nextStatementDate`/`nextPaymentDueDate`) and the available credit, so the
 * web only formats them. Keep it that way: no duplicated cycle math here.
 */

export type UpcomingCardCycle = {
  /** Closing date of the open cycle, `YYYY-MM-DD`. */
  cycleEnd: string
  /** Payment due date, null when the card has no due day. */
  dueDate: string | null
}

const MS_PER_DAY = 86_400_000

/**
 * Whole days from the local calendar day to an ISO date. Null when the date is
 * missing or invalid.
 */
export function daysUntilIsoDate(
  iso: string | null | undefined,
  now: Date = new Date()
): number | null {
  if (!iso) {
    return null
  }
  const target = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(target.getTime())) {
    return null
  }
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today) / MS_PER_DAY)
}

/** Short countdown copy for a due date; null when there is no date. */
export function countdownLabel(days: number | null): string | null {
  if (days === null) {
    return null
  }
  if (days < 0) {
    const overdue = Math.abs(days)
    return `Vencido hace ${overdue} ${overdue === 1 ? "día" : "días"}`
  }
  if (days === 0) {
    return "Vence hoy"
  }
  if (days === 1) {
    return "Vence mañana"
  }
  return `Vence en ${days} días`
}
