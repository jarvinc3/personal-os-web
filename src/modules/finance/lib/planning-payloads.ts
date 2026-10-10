import { CATALOG_NONE } from "../constants/catalog.ts"
import { percentToRateFraction } from "./interest-rate.ts"
import { parseFinanceMoney } from "./money.ts"

const INSTALLMENT_FREQS = ["WEEKLY", "BIWEEKLY", "MONTHLY"] as const
export type LoanInstallmentFreq = (typeof INSTALLMENT_FREQS)[number]

const RECEIVABLE_STATUSES = ["PENDING", "PARTIAL", "PAID", "CANCELLED"] as const
export type ReceivableStatus = (typeof RECEIVABLE_STATUSES)[number]

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export type PayloadResult<T> =
  | { ok: true; body: T }
  | { ok: false; error: string }

export type CreateSavingsGoalBody = {
  name: string
  targetAmount: number
  description?: string
  currency?: string
  targetDate?: string
  currentAmount?: number
}

/** The balance moves only through contributions, so an update never carries it. */
export type UpdateSavingsGoalBody = Omit<CreateSavingsGoalBody, "currentAmount">

export type CreateLoanBody = {
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
  currency?: string
  interestRate?: number | null
  notes?: string
}

export type CreateReceivableBody = {
  debtorName: string
  amount: number
  description?: string
  paidAmount?: number
  status?: ReceivableStatus
  currency?: string
  dueDate?: string
}

/** The collected amount moves only through payments, so an update never carries it. */
export type UpdateReceivableBody = Omit<CreateReceivableBody, "paidAmount">

function optionalTrimmed(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function optionalId(value: string | undefined): string | undefined {
  const trimmed = optionalTrimmed(value)
  if (!trimmed || trimmed === CATALOG_NONE) {
    return undefined
  }
  return trimmed
}

function requiredMoney(value: string, label: string): PayloadResult<number> {
  const amount = parseFinanceMoney(value)
  if (amount === null) {
    return { ok: false, error: `${label} inválido` }
  }
  return { ok: true, body: amount }
}

function parseIntField(
  value: string,
  label: string,
  min: number,
): PayloadResult<number> {
  const trimmed = value.trim()
  if (!trimmed) {
    return { ok: false, error: `${label} obligatorio` }
  }
  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed) || parsed < min) {
    return { ok: false, error: `${label} inválido` }
  }
  return { ok: true, body: parsed }
}

function optionalIsoDate(value: string | undefined): PayloadResult<string | undefined> {
  const trimmed = optionalTrimmed(value)
  if (!trimmed) {
    return { ok: true, body: undefined }
  }
  if (!ISO_DATE.test(trimmed)) {
    return { ok: false, error: "Fecha inválida" }
  }
  return { ok: true, body: trimmed }
}

export function buildSavingsGoalBody(
  input: {
    name: string
    targetAmount: string
    description?: string
    currency?: string
    targetDate?: string
    currentAmount?: string
  },
  options?: { isUpdate?: boolean }
): PayloadResult<UpdateSavingsGoalBody> {
  const name = input.name.trim()
  if (!name) {
    return { ok: false, error: "Nombre obligatorio" }
  }
  const target = requiredMoney(input.targetAmount, "Meta")
  if (!target.ok) return target
  if (target.body <= 0) {
    return { ok: false, error: "La meta debe ser mayor que 0" }
  }

  const currentRaw = options?.isUpdate
    ? undefined
    : optionalTrimmed(input.currentAmount)
  let currentAmount: number | undefined
  if (currentRaw) {
    const current = requiredMoney(currentRaw, "Ahorrado")
    if (!current.ok) return current
    currentAmount = current.body
  }

  const targetDate = optionalIsoDate(input.targetDate)
  if (!targetDate.ok) return targetDate

  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  const description = optionalTrimmed(input.description)

  return {
    ok: true,
    body: {
      name,
      targetAmount: target.body,
      ...(description ? { description } : {}),
      ...(currency ? { currency } : {}),
      ...(targetDate.body ? { targetDate: targetDate.body } : {}),
      ...(currentAmount !== undefined ? { currentAmount } : {}),
    },
  }
}

export function buildLoanBody(
  input: {
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
    currency?: string
    interestRatePercent?: string
    notes?: string
  },
  options?: { isUpdate?: boolean },
): PayloadResult<CreateLoanBody> {
  const lenderName = input.lenderName.trim()
  if (!lenderName) {
    return { ok: false, error: "Prestamista obligatorio" }
  }
  if (!INSTALLMENT_FREQS.includes(input.installmentFreq as LoanInstallmentFreq)) {
    return { ok: false, error: "Frecuencia inválida" }
  }

  const originalAmount = requiredMoney(input.originalAmount, "Monto original")
  if (!originalAmount.ok) return originalAmount
  const currentBalance = requiredMoney(input.currentBalance, "Saldo")
  if (!currentBalance.ok) return currentBalance
  const installmentAmount = requiredMoney(input.installmentAmount, "Cuota")
  if (!installmentAmount.ok) return installmentAmount

  const totalInstallments = parseIntField(
    input.totalInstallments,
    "Cuotas totales",
    1,
  )
  if (!totalInstallments.ok) return totalInstallments

  const paidRaw = optionalTrimmed(input.paidInstallments)
  let paidInstallments: number | undefined
  if (paidRaw) {
    const paid = parseIntField(paidRaw, "Cuotas pagadas", 0)
    if (!paid.ok) return paid
    paidInstallments = paid.body
  }

  const nextDue = optionalIsoDate(input.nextDueDate)
  if (!nextDue.ok) return nextDue
  if (!nextDue.body) {
    return { ok: false, error: "Próximo vencimiento obligatorio" }
  }

  const rate = percentToRateFraction(input.interestRatePercent ?? "")
  if (!rate.ok) return rate

  const accountId = optionalId(input.accountId)
  const institutionId = optionalId(input.institutionId)
  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  const notes = optionalTrimmed(input.notes)

  const body: CreateLoanBody = {
    lenderName,
    originalAmount: originalAmount.body,
    currentBalance: currentBalance.body,
    installmentAmount: installmentAmount.body,
    installmentFreq: input.installmentFreq as LoanInstallmentFreq,
    totalInstallments: totalInstallments.body,
    nextDueDate: nextDue.body,
    ...(paidInstallments !== undefined ? { paidInstallments } : {}),
    ...(institutionId ? { institutionId } : {}),
    ...(accountId ? { accountId } : {}),
    ...(currency ? { currency } : {}),
    ...(notes ? { notes } : {}),
  }

  if (rate.interestRate !== undefined) {
    body.interestRate = rate.interestRate
  } else if (options?.isUpdate) {
    body.interestRate = null
  }

  return { ok: true, body }
}

export function buildReceivableBody(
  input: {
    debtorName: string
    amount: string
    description?: string
    paidAmount?: string
    status?: string
    currency?: string
    dueDate?: string
  },
  options?: { isUpdate?: boolean }
): PayloadResult<UpdateReceivableBody> {
  const debtorName = input.debtorName.trim()
  if (!debtorName) {
    return { ok: false, error: "Deudor obligatorio" }
  }

  const amount = requiredMoney(input.amount, "Monto")
  if (!amount.ok) return amount
  if (amount.body < 0) {
    return { ok: false, error: "El monto debe ser mayor o igual a 0" }
  }

  const statusRaw = optionalTrimmed(input.status)
  if (statusRaw && !RECEIVABLE_STATUSES.includes(statusRaw as ReceivableStatus)) {
    return { ok: false, error: "Estado inválido" }
  }
  const status = statusRaw as ReceivableStatus | undefined

  const paidRaw = options?.isUpdate
    ? undefined
    : optionalTrimmed(input.paidAmount)
  let paidAmount: number | undefined
  if (paidRaw) {
    const paid = requiredMoney(paidRaw, "Cobrado")
    if (!paid.ok) return paid
    if (paid.body > amount.body) {
      return { ok: false, error: "paidAmount cannot exceed amount" }
    }
    paidAmount = paid.body
  }

  const dueDate = optionalIsoDate(input.dueDate)
  if (!dueDate.ok) return dueDate

  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  const description = optionalTrimmed(input.description)

  const body: CreateReceivableBody = {
    debtorName,
    amount: amount.body,
    ...(description ? { description } : {}),
    ...(currency ? { currency } : {}),
    ...(dueDate.body ? { dueDate: dueDate.body } : {}),
    ...(status ? { status } : {}),
  }

  // PAID without paidAmount: omit so the API fills paidAmount = amount.
  if (paidAmount !== undefined) {
    body.paidAmount = paidAmount
  }

  return { ok: true, body }
}

export type CreateSavingsGoalContributionBody = {
  amount: number
  contributedAt?: string
  notes?: string
}

export function buildSavingsGoalContributionBody(input: {
  amount: string
  contributedAt?: string
  notes?: string
}): PayloadResult<CreateSavingsGoalContributionBody> {
  const amount = requiredMoney(input.amount, "Aporte")
  if (!amount.ok) {
    return amount
  }
  if (amount.body <= 0) {
    return { ok: false, error: "El aporte debe ser mayor que 0" }
  }

  const contributedAt = optionalIsoDate(input.contributedAt)
  if (!contributedAt.ok) {
    return contributedAt
  }

  const notes = optionalTrimmed(input.notes)

  return {
    ok: true,
    body: {
      amount: amount.body,
      ...(contributedAt.body ? { contributedAt: contributedAt.body } : {}),
      ...(notes ? { notes } : {}),
    },
  }
}

export type RecordReceivablePaymentBody = {
  amount: number
  accountId: string
  paidAt?: string
  notes?: string
}

export function buildReceivablePaymentBody(input: {
  amount: string
  accountId: string
  paidAt?: string
  notes?: string
}): PayloadResult<RecordReceivablePaymentBody> {
  const amount = requiredMoney(input.amount, "Cobro")
  if (!amount.ok) {
    return amount
  }
  if (amount.body <= 0) {
    return { ok: false, error: "El cobro debe ser mayor que 0" }
  }

  const accountId = input.accountId.trim()
  if (!accountId) {
    return { ok: false, error: "Cuenta obligatoria" }
  }

  const paidAt = optionalIsoDate(input.paidAt)
  if (!paidAt.ok) {
    return paidAt
  }

  const notes = optionalTrimmed(input.notes)

  return {
    ok: true,
    body: {
      amount: amount.body,
      accountId,
      ...(paidAt.body ? { paidAt: paidAt.body } : {}),
      ...(notes ? { notes } : {}),
    },
  }
}
