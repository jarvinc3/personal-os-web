import { formatCalendarDate } from "./ledger-form.ts"
import { formatFinanceMoney, type FinanceMoneyDisplay } from "./money.ts"
import type { LoanPrepaymentMode } from "./planning-payloads.ts"

export const PREPAYMENT_MODE_EXPLANATION: Record<LoanPrepaymentMode, string> = {
  REDUCE_TERM: "Pagas la misma cuota y terminas antes.",
  REDUCE_INSTALLMENT: "Terminas en la misma fecha y pagas menos cada mes.",
}

/** What the preview endpoint returns for an abono. */
export type LoanPrepaymentPreview = {
  newBalance: number
  totalInstallments: number
  installmentAmount: number
  interestRemaining: number
  newEndDate: string
}

/**
 * What the abono does to the schedule. A «Reducir plazo» abono that does not
 * remove a whole installment keeps the term, and that has to be said instead of
 * looking like nothing happened.
 */
export function prepaymentPreviewLines(input: {
  preview: LoanPrepaymentPreview
  currentInstallments: number
  mode: LoanPrepaymentMode
  display: FinanceMoneyDisplay
}): string[] {
  const { preview, currentInstallments, mode, display } = input
  const lines: string[] = []
  if (
    mode === "REDUCE_TERM" &&
    preview.totalInstallments >= currentInstallments
  ) {
    lines.push("El plazo no cambia: baja el monto de la última cuota.")
  }
  lines.push(
    `Cuota nueva ${formatFinanceMoney(preview.installmentAmount, display)}`
  )
  lines.push(
    `${preview.totalInstallments} cuotas · termina el ${formatCalendarDate(preview.newEndDate, display.locale)}`
  )
  lines.push(
    `Interés restante ${formatFinanceMoney(preview.interestRemaining, display)}`
  )
  return lines
}
