import { percentToRateFraction } from "./interest-rate.ts"
import type { PayloadResult } from "./planning-fields.ts"
import {
  optionalId,
  optionalIsoDate,
  optionalTrimmed,
  parseIntField,
  requiredMoney,
} from "./planning-fields.ts"
import { parseFinanceMoney } from "./money.ts"

const INSTALLMENT_FREQS = ["WEEKLY", "BIWEEKLY", "MONTHLY"] as const
export type LoanInstallmentFreq = (typeof INSTALLMENT_FREQS)[number]

export type CreateLoanBody = {
  name?: string
  lenderName: string
  originalAmount: number
  currentBalance: number
  installmentAmount: number
  installmentFreq: LoanInstallmentFreq
  totalInstallments: number
  nextDueDate: string
  paidInstallments?: number
  institutionId?: string
  accountId?: string
  disbursementAccountId?: string
  currency?: string
  interestRate?: number | null
  rateType?: "FIXED" | "VARIABLE"
  insuranceAmount?: number | null
  prepaymentPenaltyPct?: number | null
  disbursementDate?: string | null
  notes?: string
}

/**
 * Nombre del préstamo en el body: en un update, sin nombre explícito se manda
 * vacío para borrarlo; en un alta se omite.
 */
function loanNameField(
  name: string | undefined,
  isUpdate: boolean
): { name?: string } {
  if (name) {
    return { name }
  }
  if (isUpdate) {
    return { name: "" }
  }
  return {}
}

export function loanMoneyFields(input: {
  originalAmount: string
  currentBalance: string
  installmentAmount: string
}): PayloadResult<{
  originalAmount: number
  currentBalance: number
  installmentAmount: number
}> {
  const originalAmount = requiredMoney(input.originalAmount, "Monto original")
  if (!originalAmount.ok) {
    return originalAmount
  }
  const currentBalance = requiredMoney(input.currentBalance, "Saldo")
  if (!currentBalance.ok) {
    return currentBalance
  }
  const installmentAmount = requiredMoney(input.installmentAmount, "Cuota")
  if (!installmentAmount.ok) {
    return installmentAmount
  }
  return {
    ok: true,
    body: {
      originalAmount: originalAmount.body,
      currentBalance: currentBalance.body,
      installmentAmount: installmentAmount.body,
    },
  }
}

export function loanScheduleFields(input: {
  installmentFreq: string
  totalInstallments: string
  nextDueDate: string
  paidInstallments?: string
}): PayloadResult<{
  installmentFreq: LoanInstallmentFreq
  totalInstallments: number
  nextDueDate: string
  paidInstallments?: number
}> {
  if (
    !INSTALLMENT_FREQS.includes(input.installmentFreq as LoanInstallmentFreq)
  ) {
    return { ok: false, error: "Frecuencia inválida" }
  }
  const totalInstallments = parseIntField(
    input.totalInstallments,
    "Cuotas totales",
    1
  )
  if (!totalInstallments.ok) {
    return totalInstallments
  }
  const nextDue = optionalIsoDate(input.nextDueDate)
  if (!nextDue.ok) {
    return nextDue
  }
  if (!nextDue.body) {
    return { ok: false, error: "Próximo vencimiento obligatorio" }
  }
  const paidRaw = optionalTrimmed(input.paidInstallments)
  if (!paidRaw) {
    return {
      ok: true,
      body: {
        installmentFreq: input.installmentFreq as LoanInstallmentFreq,
        totalInstallments: totalInstallments.body,
        nextDueDate: nextDue.body,
      },
    }
  }
  const paidInstallments = parseIntField(paidRaw, "Cuotas pagadas", 0)
  if (!paidInstallments.ok) {
    return paidInstallments
  }
  return {
    ok: true,
    body: {
      installmentFreq: input.installmentFreq as LoanInstallmentFreq,
      totalInstallments: totalInstallments.body,
      nextDueDate: nextDue.body,
      paidInstallments: paidInstallments.body,
    },
  }
}

export function loanRateField(input: {
  interestRatePercent?: string
}): PayloadResult<{ interestRate?: number }> {
  const rate = percentToRateFraction(input.interestRatePercent ?? "")
  if (!rate.ok) {
    return rate
  }
  return { ok: true, body: { interestRate: rate.interestRate } }
}

export function loanIdentityFields(
  input: {
    name?: string
    institutionId?: string
    accountId?: string
    disbursementAccountId?: string
    currency?: string
    notes?: string
  },
  isUpdate: boolean
): Partial<CreateLoanBody> {
  const accountId = optionalId(input.accountId)
  const disbursementAccountId = isUpdate
    ? undefined
    : optionalId(input.disbursementAccountId)
  const institutionId = optionalId(input.institutionId)
  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  const name = optionalTrimmed(input.name)
  const notes = optionalTrimmed(input.notes)
  return {
    ...loanNameField(name, isUpdate),
    ...(institutionId ? { institutionId } : {}),
    ...(accountId ? { accountId } : {}),
    ...(disbursementAccountId ? { disbursementAccountId } : {}),
    ...(currency ? { currency } : {}),
    ...(notes ? { notes } : {}),
  }
}

function loanInsuranceAmount(
  value: string | undefined
): PayloadResult<number | undefined> {
  if (value === undefined) {
    return { ok: true, body: undefined }
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return { ok: true, body: undefined }
  }
  const insurance = parseFinanceMoney(trimmed)
  if (insurance === null) {
    return { ok: false, error: "Seguro inválido" }
  }
  return { ok: true, body: insurance }
}

function loanPenalty(
  value: string | undefined
): PayloadResult<number | undefined> {
  if (value === undefined) {
    return { ok: true, body: undefined }
  }
  const penalty = percentToRateFraction(value)
  if (!penalty.ok) {
    return penalty
  }
  return { ok: true, body: penalty.interestRate }
}

function loanDisbursementDate(
  value: string | null | undefined
): PayloadResult<string | undefined> {
  if (!value) {
    return { ok: true, body: undefined }
  }
  const disbursement = optionalIsoDate(value)
  if (!disbursement.ok) {
    return disbursement
  }
  return { ok: true, body: disbursement.body }
}

export function loanExtraFields(
  input: {
    rateType?: "FIXED" | "VARIABLE"
    insuranceAmount?: string
    prepaymentPenaltyPct?: string
    disbursementDate?: string | null
  },
  rate: { interestRate?: number },
  isUpdate: boolean
): PayloadResult<Partial<CreateLoanBody>> {
  const fields: Partial<CreateLoanBody> = {}
  if (rate.interestRate !== undefined) {
    fields.interestRate = rate.interestRate
  } else if (isUpdate) {
    fields.interestRate = null
  }
  if (input.rateType) {
    fields.rateType = input.rateType
  }
  const insurance = loanInsuranceAmount(input.insuranceAmount)
  if (!insurance.ok) {
    return insurance
  }
  if (insurance.body !== undefined) {
    fields.insuranceAmount = insurance.body
  }
  const penalty = loanPenalty(input.prepaymentPenaltyPct)
  if (!penalty.ok) {
    return penalty
  }
  if (penalty.body !== undefined) {
    fields.prepaymentPenaltyPct = penalty.body
  }
  const disbursement = loanDisbursementDate(input.disbursementDate)
  if (!disbursement.ok) {
    return disbursement
  }
  if (disbursement.body !== undefined) {
    fields.disbursementDate = disbursement.body
  }
  return { ok: true, body: fields }
}
