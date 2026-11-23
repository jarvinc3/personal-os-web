import type { PayloadResult } from "./planning-fields.ts"
import {
  optionalIsoDate,
  optionalTrimmed,
  requiredMoney,
} from "./planning-fields.ts"

export type CreateSavingsGoalBody = {
  name: string
  targetAmount: number
  accountId: string
  mode?: "EARMARK" | "DEDICATED"
  description?: string
  currency?: string
  /** `null` clears the date; a string sets it. */
  targetDate?: string | null
  currentAmount?: number
}

/** The balance moves only through contributions, so an update never carries it. */
export type UpdateSavingsGoalBody = Omit<CreateSavingsGoalBody, "currentAmount">

export type CreateSavingsGoalContributionBody = {
  amount: number
  kind?: "CONTRIBUTION" | "WITHDRAWAL"
  date?: string
  notes?: string
  /** Account the money comes from; the API moves it when it is not the goal account. */
  fromAccountId?: string
  /** Account that receives a withdrawal. */
  toAccountId?: string
  fromTransferGroupId?: string
}

function savingsGoalCurrentAmount(
  value: string | undefined,
  isUpdate: boolean
): PayloadResult<number | undefined> {
  if (isUpdate) {
    return { ok: true, body: undefined }
  }
  const currentRaw = optionalTrimmed(value)
  if (!currentRaw) {
    return { ok: true, body: undefined }
  }
  const current = requiredMoney(currentRaw, "Ahorrado")
  if (!current.ok) {
    return current
  }
  return { ok: true, body: current.body }
}

function savingsGoalOptionals(input: {
  mode?: "EARMARK" | "DEDICATED"
  description?: string
  currency?: string
}): {
  mode?: "EARMARK" | "DEDICATED"
  description?: string
  currency?: string
} {
  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  const description = optionalTrimmed(input.description)
  return {
    ...(input.mode ? { mode: input.mode } : {}),
    ...(description ? { description } : {}),
    ...(currency ? { currency } : {}),
  }
}

export function buildSavingsGoalBody(
  input: {
    name: string
    targetAmount: string
    accountId: string
    mode?: "EARMARK" | "DEDICATED"
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
  if (!target.ok) {
    return target
  }
  if (target.body <= 0) {
    return { ok: false, error: "La meta debe ser mayor que 0" }
  }
  const accountId = optionalTrimmed(input.accountId)
  if (!accountId) {
    return { ok: false, error: "Cuenta obligatoria" }
  }
  const current = savingsGoalCurrentAmount(
    input.currentAmount,
    options?.isUpdate === true
  )
  if (!current.ok) {
    return current
  }
  const targetDate = optionalIsoDate(input.targetDate)
  if (!targetDate.ok) {
    return targetDate
  }

  return {
    ok: true,
    body: {
      name,
      targetAmount: target.body,
      accountId,
      ...savingsGoalOptionals(input),
      targetDate: targetDate.body ?? null,
      ...(current.body !== undefined ? { currentAmount: current.body } : {}),
    },
  }
}

export function buildSavingsGoalContributionBody(input: {
  amount: string
  kind?: "CONTRIBUTION" | "WITHDRAWAL"
  date?: string
  notes?: string
  fromAccountId?: string
  toAccountId?: string
  fromTransferGroupId?: string
}): PayloadResult<CreateSavingsGoalContributionBody> {
  const amount = requiredMoney(input.amount, "Aporte")
  if (!amount.ok) {
    return amount
  }
  if (amount.body <= 0) {
    return { ok: false, error: "El monto debe ser mayor que 0" }
  }

  const date = optionalIsoDate(input.date)
  if (!date.ok) {
    return date
  }

  const notes = optionalTrimmed(input.notes)
  const fromAccountId = optionalTrimmed(input.fromAccountId)
  const toAccountId = optionalTrimmed(input.toAccountId)
  const transferGroupId = optionalTrimmed(input.fromTransferGroupId)

  return {
    ok: true,
    body: {
      amount: amount.body,
      ...(input.kind ? { kind: input.kind } : {}),
      ...(date.body ? { date: date.body } : {}),
      ...(notes ? { notes } : {}),
      ...(fromAccountId ? { fromAccountId } : {}),
      ...(toAccountId ? { toAccountId } : {}),
      ...(transferGroupId ? { fromTransferGroupId: transferGroupId } : {}),
    },
  }
}
