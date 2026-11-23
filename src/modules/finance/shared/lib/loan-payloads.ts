import type { PayloadResult } from "./planning-fields.ts"
import { optionalId, optionalTrimmed } from "./planning-fields.ts"
import {
  loanExtraFields,
  loanIdentityFields,
  loanMoneyFields,
  loanRateField,
  loanScheduleFields,
  type CreateLoanBody,
} from "./loan-create-fields.ts"
import { parseFinanceMoney } from "./money.ts"

export type {
  CreateLoanBody,
  LoanInstallmentFreq,
} from "./loan-create-fields.ts"

export const LOAN_PREPAYMENT_MODES = [
  "REDUCE_TERM",
  "REDUCE_INSTALLMENT",
] as const
export type LoanPrepaymentMode = (typeof LOAN_PREPAYMENT_MODES)[number]

export type LoanPrepaymentBody = {
  amount: number
  accountId: string
  mode: LoanPrepaymentMode
  date?: string
}

export type PayLoanInstallmentBody = {
  amount: number
  accountId: string
  /** Only when the user chose to send the excess to the principal. */
  excessAsPrepayment?: boolean
}

export type LoanInstallmentPaymentResult = {
  installmentNo: number
  breakdown: {
    lateFee: number
    fees: number
    insurance: number
    interest: number
    principal: number
  }
  paidAmount: number
  status: "PAID" | "PARTIAL"
  currentBalance: number
}

export function buildLoanPrepaymentBody(input: {
  amount: string
  accountId?: string
  mode: LoanPrepaymentMode
  date?: string
}): PayloadResult<LoanPrepaymentBody> {
  const amount = parseFinanceMoney(input.amount)
  if (amount === null || amount <= 0) {
    return { ok: false, error: "Monto inválido" }
  }
  const accountId = optionalId(input.accountId)
  if (!accountId) {
    return { ok: false, error: "Elige una cuenta de origen" }
  }
  const body: LoanPrepaymentBody = {
    amount,
    accountId,
    mode: input.mode,
  }
  const date = optionalTrimmed(input.date)
  if (date) {
    body.date = date
  }
  return { ok: true, body }
}

export function buildPayLoanInstallmentBody(input: {
  amount: string
  accountId?: string
  excessAsPrepayment?: boolean
}): PayloadResult<PayLoanInstallmentBody> {
  const amount = parseFinanceMoney(input.amount)
  if (amount === null || amount <= 0) {
    return { ok: false, error: "Monto inválido" }
  }
  const accountId = optionalId(input.accountId)
  if (!accountId) {
    return { ok: false, error: "Elige una cuenta de pago" }
  }
  return {
    ok: true,
    body: {
      amount,
      accountId,
      ...(input.excessAsPrepayment ? { excessAsPrepayment: true } : {}),
    },
  }
}

export function buildLoanBody(
  input: {
    name?: string
    lenderName: string
    originalAmount: string
    currentBalance: string
    installmentAmount: string
    installmentFreq: string
    totalInstallments: string
    nextDueDate: string
    paidInstallments?: string
    institutionId?: string
    accountId?: string
    disbursementAccountId?: string
    currency?: string
    interestRatePercent?: string
    rateType?: "FIXED" | "VARIABLE"
    insuranceAmount?: string
    prepaymentPenaltyPct?: string
    disbursementDate?: string | null
    notes?: string
  },
  options?: { isUpdate?: boolean }
): PayloadResult<CreateLoanBody> {
  const lenderName = input.lenderName.trim()
  if (!lenderName) {
    return { ok: false, error: "Prestamista obligatorio" }
  }
  const money = loanMoneyFields(input)
  if (!money.ok) {
    return money
  }
  const schedule = loanScheduleFields(input)
  if (!schedule.ok) {
    return schedule
  }
  const rate = loanRateField(input)
  if (!rate.ok) {
    return rate
  }
  const isUpdate = options?.isUpdate === true
  const extras = loanExtraFields(input, rate.body, isUpdate)
  if (!extras.ok) {
    return extras
  }

  return {
    ok: true,
    body: {
      lenderName,
      ...money.body,
      ...schedule.body,
      ...loanIdentityFields(input, isUpdate),
      ...extras.body,
    },
  }
}
