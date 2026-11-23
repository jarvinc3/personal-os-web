import type { PayloadResult } from "./planning-fields.ts"
import {
  optionalIsoDate,
  optionalTrimmed,
  requiredMoney,
} from "./planning-fields.ts"

const RECEIVABLE_STATUSES = ["PENDING", "PARTIAL", "PAID", "CANCELLED"] as const
export type ReceivableStatus = (typeof RECEIVABLE_STATUSES)[number]

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

export type RecordReceivablePaymentBody = {
  amount: number
  accountId: string
  paidAt?: string
  notes?: string
  excessHandling?: "EXTRA_INCOME" | "CREDIT_BALANCE" | "APPLY_TO_RECEIVABLE"
  targetReceivableId?: string
}

function receivableStatus(
  value: string | undefined
): PayloadResult<ReceivableStatus | undefined> {
  const statusRaw = optionalTrimmed(value)
  if (!statusRaw) {
    return { ok: true, body: undefined }
  }
  if (!RECEIVABLE_STATUSES.includes(statusRaw as ReceivableStatus)) {
    return { ok: false, error: "Estado inválido" }
  }
  return { ok: true, body: statusRaw as ReceivableStatus }
}

function receivablePaidAmount(
  value: string | undefined,
  amount: number,
  isUpdate: boolean
): PayloadResult<number | undefined> {
  if (isUpdate) {
    return { ok: true, body: undefined }
  }
  const paidRaw = optionalTrimmed(value)
  if (!paidRaw) {
    return { ok: true, body: undefined }
  }
  const paid = requiredMoney(paidRaw, "Cobrado")
  if (!paid.ok) {
    return paid
  }
  if (paid.body > amount) {
    return { ok: false, error: "paidAmount cannot exceed amount" }
  }
  return { ok: true, body: paid.body }
}

function receivableOptionalFields(input: {
  description?: string
  currency?: string
  dueDate?: string
}): PayloadResult<
  Pick<CreateReceivableBody, "description" | "currency" | "dueDate">
> {
  const dueDate = optionalIsoDate(input.dueDate)
  if (!dueDate.ok) {
    return dueDate
  }
  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  const description = optionalTrimmed(input.description)
  return {
    ok: true,
    body: {
      ...(description ? { description } : {}),
      ...(currency ? { currency } : {}),
      ...(dueDate.body ? { dueDate: dueDate.body } : {}),
    },
  }
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
  if (!amount.ok) {
    return amount
  }
  if (amount.body < 0) {
    return { ok: false, error: "El monto debe ser mayor o igual a 0" }
  }
  const status = receivableStatus(input.status)
  if (!status.ok) {
    return status
  }
  const paidAmount = receivablePaidAmount(
    input.paidAmount,
    amount.body,
    options?.isUpdate === true
  )
  if (!paidAmount.ok) {
    return paidAmount
  }
  const optionals = receivableOptionalFields(input)
  if (!optionals.ok) {
    return optionals
  }

  const body: CreateReceivableBody = {
    debtorName,
    amount: amount.body,
    ...optionals.body,
    ...(status.body ? { status: status.body } : {}),
  }
  // PAID without paidAmount: omit so the API fills paidAmount = amount.
  if (paidAmount.body !== undefined) {
    body.paidAmount = paidAmount.body
  }

  return { ok: true, body }
}

export function buildReceivablePaymentBody(input: {
  amount: string
  accountId: string
  paidAt?: string
  notes?: string
  excessHandling?: "EXTRA_INCOME" | "CREDIT_BALANCE" | "APPLY_TO_RECEIVABLE"
  targetReceivableId?: string
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
      ...(input.excessHandling ? { excessHandling: input.excessHandling } : {}),
      ...(input.targetReceivableId
        ? { targetReceivableId: input.targetReceivableId }
        : {}),
    },
  }
}
