import { formatCalendarDate } from "./ledger-form.ts"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "./money.ts"
import type { LoanPrepaymentMode } from "./planning-payloads.ts"
import type { FinanceAccount } from "@/src/modules/finance/shared/types/entities"

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
 * Account an abono comes from: the loan's «Se paga desde», and only when it has
 * none, the first account with free balance.
 */
export function defaultPrepaymentAccountId(input: {
  accounts: readonly FinanceAccount[]
  loanAccountId: string | null
  currency: string
}): string {
  const { accounts, loanAccountId, currency } = input
  const active = accounts.filter((account) => account.isActive)
  if (loanAccountId && active.some((account) => account.id === loanAccountId)) {
    return loanAccountId
  }
  const hasFreeBalance = (account: FinanceAccount) =>
    (parseFinanceMoney(account.freeBalance) ?? 0) > 0
  const wanted = currency.trim().toUpperCase()
  const sameCurrency = active.find(
    (account) =>
      account.currency.trim().toUpperCase() === wanted &&
      hasFreeBalance(account)
  )
  if (sameCurrency) {
    return sameCurrency.id
  }
  return active.find(hasFreeBalance)?.id ?? ""
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
