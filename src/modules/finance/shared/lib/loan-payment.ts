import { parseFinanceMoney } from "./money.ts"
import type {
  FinanceAccount,
  FinanceLoanInstallment,
} from "@/src/modules/finance/shared/types/entities"

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Account a loan payment comes from: the loan's «Se paga desde», and only when
 * it has none, the first account with free balance (preferring the loan's
 * currency).
 */
export function defaultLoanPaymentAccountId(input: {
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

/** What the installment asks for: principal, interest, insurance, fees and late fee. */
export function installmentDueTotal(
  installment: FinanceLoanInstallment
): number {
  const parts = [
    installment.principal,
    installment.interest,
    installment.insurance,
    installment.fees,
    installment.lateFee,
  ]
  return roundMoney(
    parts.reduce((sum, part) => sum + (parseFinanceMoney(part) ?? 0), 0)
  )
}

/** The part of the payment that goes past the installment; 0 when it fits. */
export function installmentExcess(amount: number, dueTotal: number): number {
  return Math.max(0, roundMoney(amount - dueTotal))
}

/** Oldest installment that is not paid yet: the only one that can be paid. */
export function nextUnpaidInstallment(
  installments: readonly FinanceLoanInstallment[]
): FinanceLoanInstallment | null {
  return (
    installments.find((installment) => installment.status !== "PAID") ?? null
  )
}
