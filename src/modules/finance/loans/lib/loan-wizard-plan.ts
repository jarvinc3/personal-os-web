import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceInstallmentFreq } from "@/src/modules/finance/shared/types/entities"
import { computeLoanPlan, type LoanPlan } from "./loan-wizard.ts"
import type { LoanWizardValues } from "./loan-form.ts"

/**
 * Preview of the loan the wizard would create, or null while the numbers
 * cannot produce one. The clock is injected so the preview is testable.
 */
export function loanWizardPlan({
  values,
  now = new Date(),
}: {
  values: LoanWizardValues | undefined
  now?: Date
}): LoanPlan | null {
  const principal = parseFinanceMoney(values?.amount ?? "")
  const periods = Number(values?.periods ?? "0")
  if (principal === null || principal <= 0 || periods < 1) {
    return null
  }
  const disbursementDate = values?.disbursementDate
    ? new Date(`${values.disbursementDate}T12:00:00`)
    : now
  const freq: FinanceInstallmentFreq = values?.freq ?? "MONTHLY"
  if (values?.known === "INSTALLMENT") {
    const installmentAmount = parseFinanceMoney(values?.installment ?? "")
    if (installmentAmount === null || installmentAmount <= 0) {
      return null
    }
    return computeLoanPlan({
      principal,
      periods,
      freq,
      disbursementDate,
      now,
      known: "INSTALLMENT",
      installmentAmount,
    })
  }
  const rateText = values?.ratePercent?.trim() ?? ""
  const annualRatePercent = rateText === "" ? 0 : Number(rateText)
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    return null
  }
  return computeLoanPlan({
    principal,
    periods,
    freq,
    disbursementDate,
    now,
    known: "RATE",
    annualRatePercent,
  })
}
