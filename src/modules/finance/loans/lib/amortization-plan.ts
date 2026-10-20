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
  /**
   * Capital pendiente después de esta cuota. Queda en null cuando una cuota no
   * trae un capital legible y el saldo ya no se puede reconstruir.
   */
  remainingBalance: number | null
}

/**
 * El saldo del préstamo ya descontó las cuotas pagadas, así que el plan
 * empieza sumándoles su capital para reconstruir el saldo inicial y desde ahí
 * resta el capital de cada cuota. Devuelve null si una cuota pagada no trae un
 * capital legible.
 */
function initialBalance(
  installments: readonly FinanceLoanInstallment[],
  currentBalance: number
): number | null {
  let paidPrincipal = 0
  for (const installment of installments) {
    if (installment.status !== "PAID") {
      continue
    }
    const principal = parseFinanceMoney(installment.principal)
    if (principal === null) {
      return null
    }
    paidPrincipal += principal
  }
  return currentBalance + paidPrincipal
}

export function buildAmortizationPlan(
  installments: readonly FinanceLoanInstallment[],
  currentBalance: number
): AmortizationRow[] {
  const ordered = installments
    .slice()
    .sort((left, right) => left.installmentNo - right.installmentNo)
  let remainingBalance = initialBalance(ordered, currentBalance)
  return ordered.map((installment) => {
    const principal = parseFinanceMoney(installment.principal)
    remainingBalance =
      remainingBalance === null || principal === null
        ? null
        : roundToCents(remainingBalance - principal)
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
