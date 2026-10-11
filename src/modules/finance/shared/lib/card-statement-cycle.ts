/**
 * Open billing cycle of a credit card, projected from its closing day.
 *
 * The backend owns this rule and only persists closed cycles, so the card
 * detail needs the projection to show the cycle that is still running. These
 * helpers mirror `packages/finance/src/statements/domain/card-statement-cycle.ts`
 * on purpose: keep both in step. Days are UTC days, the same ones the backend
 * uses to decide that a cycle closed, so the projection never contradicts the
 * list of closed statements. Reference:
 * `personal-os-back/docs/modules/finance/capabilities/statements.md`.
 */

export type UpcomingCardCycle = {
  /** Closing date of the open cycle, `YYYY-MM-DD`. */
  cycleEnd: string
  /** Payment due date, null when the card has no due day. */
  dueDate: string | null
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

/** The statement day inside a month, clamped to that month's last day. */
function statementDateOfMonth(year: number, month: number, day: number): Date {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return new Date(Date.UTC(year, month - 1, Math.min(day, lastDay)))
}

function shiftStatementMonths(date: Date, day: number, months: number): Date {
  const zeroBased = date.getUTCMonth() + months
  const shiftedYear = date.getUTCFullYear() + Math.floor(zeroBased / 12)
  const shiftedMonth = (((zeroBased % 12) + 12) % 12) + 1
  return statementDateOfMonth(shiftedYear, shiftedMonth, day)
}

function statementDateOnOrAfter(day: number, reference: Date): Date {
  const candidate = statementDateOfMonth(
    reference.getUTCFullYear(),
    reference.getUTCMonth() + 1,
    day
  )
  if (candidate.getTime() >= reference.getTime()) {
    return candidate
  }
  return shiftStatementMonths(candidate, day, 1)
}

/** Strictly after the closing date, so a due day equal to it moves one month. */
function firstDueDateAfter(closingDate: Date, dueDay: number): Date {
  const candidate = statementDateOfMonth(
    closingDate.getUTCFullYear(),
    closingDate.getUTCMonth() + 1,
    dueDay
  )
  if (candidate.getTime() > closingDate.getTime()) {
    return candidate
  }
  return shiftStatementMonths(candidate, dueDay, 1)
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Null when the card has no closing day: the backend creates no statements for
 * it, so there is no cycle to project either.
 */
export function buildUpcomingCardCycle(input: {
  closingDay: number | null
  dueDay: number | null
  now?: Date
}): UpcomingCardCycle | null {
  const { closingDay, dueDay, now = new Date() } = input
  if (closingDay === null) {
    return null
  }
  const cycleEnd = statementDateOnOrAfter(closingDay, startOfUtcDay(now))
  if (dueDay === null) {
    return { cycleEnd: toDateKey(cycleEnd), dueDate: null }
  }
  return {
    cycleEnd: toDateKey(cycleEnd),
    dueDate: toDateKey(firstDueDateAfter(cycleEnd, dueDay)),
  }
}
