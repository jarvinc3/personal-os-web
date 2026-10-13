import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceLoanInstallment } from "@/src/modules/finance/shared/types/entities"
import { roundToCents } from "./loan-wizard.ts"

export type AmortizationRow = {
  installmentNo: number
  dueDate: string
  amount: string
  principal: string
  interest: string
  insurance: string
  fees: string
  paidAmount: string
  status: FinanceLoanInstallment["status"]
  /** Capital pendiente después de esta cuota. */
  remainingBalance: number
}

/**
 * El saldo del préstamo ya descontó las cuotas pagadas, así que el plan
 * empieza sumándoles su capital para reconstruir el saldo inicial y desde ahí
 * resta el capital de cada cuota.
 */
export function buildAmortizationPlan(
  installments: readonly FinanceLoanInstallment[],
  currentBalance: number
): AmortizationRow[] {
  const ordered = installments
    .slice()
    .sort((left, right) => left.installmentNo - right.installmentNo)
  const paidPrincipal = ordered
    .filter((installment) => installment.status === "PAID")
    .reduce(
      (total, installment) =>
        total + (parseFinanceMoney(installment.principal) ?? 0),
      0
    )
  let remainingBalance = currentBalance + paidPrincipal
  return ordered.map((installment) => {
    remainingBalance = roundToCents(
      remainingBalance - (parseFinanceMoney(installment.principal) ?? 0)
    )
    return {
      installmentNo: installment.installmentNo,
      dueDate: installment.dueDate,
      amount: installment.amount,
      principal: installment.principal,
      interest: installment.interest,
      insurance: installment.insurance,
      fees: installment.fees,
      paidAmount: installment.paidAmount,
      status: installment.status,
      remainingBalance,
    }
  })
}
