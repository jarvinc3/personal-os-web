import { z } from "zod"

import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { receivablePending } from "@/src/modules/finance/shared/lib/planning-lists"
import type {
  FinanceReceivable,
  FinanceReceivableStatus,
} from "@/src/modules/finance/shared/types/entities"

/** Same bound as the create DTO of the API, so one link stays manageable. */
export const MAX_RECEIVABLE_SHARE_ITEMS = 50

/** Characters kept at each end of the token when the link is shown shortened. */
const MASKED_TOKEN_EDGE = 4

const WHATSAPP_SHARE_URL = "https://wa.me/"

/** Closed cobros never reach the public page, so they cannot be shared either. */
const UNSHAREABLE_STATUSES: readonly FinanceReceivableStatus[] = [
  "CANCELLED",
  "WRITTEN_OFF",
]

const CONCEPT_FALLBACK = "Cobro sin concepto"

/** `POST /finance/receivable-shares` response. */
export type FinanceReceivableShare = {
  id: string
  token: string
  url: string
  debtorName: string
  isActive: boolean
  expiresAt: string | null
  createdAt: string
  /** `items` on create, `itemCount` on list, revoke and regenerate. */
  items?: string[]
  itemCount?: number
  revokedAt?: string | null
}

export type CreateReceivableShareBody = {
  receivableIds: string[]
  debtorName: string
}

export const receivableShareSchema = z.object({
  debtorName: z
    .string()
    .trim()
    .min(1, "Escribe el nombre del deudor.")
    .max(120, "Máximo 120 caracteres."),
})

export type ReceivableShareFormValues = z.infer<typeof receivableShareSchema>

export type ShareCurrencyPending = {
  currency: string
  pending: number
  label: string
}

export type ShareSummaryLine = {
  id: string
  concept: string
  pendingLabel: string
}

type ShareSelectionResult =
  { ok: true; body: CreateReceivableShareBody } | { ok: false; error: string }

export function shareableReceivables(
  receivables: readonly FinanceReceivable[]
): FinanceReceivable[] {
  return receivables.filter(
    (receivable) => !UNSHAREABLE_STATUSES.includes(receivable.status)
  )
}

/** Pending per currency. Currencies are never converted into each other. */
export function shareSelectionTotals(
  receivables: readonly FinanceReceivable[],
  display: FinanceMoneyDisplay
): ShareCurrencyPending[] {
  const currencies = [
    ...new Set(
      receivables.map((receivable) => receivable.currency.toUpperCase())
    ),
  ].sort()

  return currencies.map((currency) => {
    const pending = receivables
      .filter((receivable) => receivable.currency.toUpperCase() === currency)
      .reduce((sum, receivable) => sum + receivablePending(receivable), 0)
    return {
      currency,
      pending,
      label: formatFinanceMoney(pending, { ...display, currency }),
    }
  })
}

/** `RD$9,650.00 + US$120.00`, or a dash when nothing is selected. */
export function formatSharePendingTotals(
  totals: readonly ShareCurrencyPending[]
): string {
  if (totals.length === 0) {
    return "—"
  }
  return totals.map((total) => total.label).join(" + ")
}

export function receivableShareConcept(receivable: FinanceReceivable): string {
  const description = receivable.description?.trim()
  return description ? description : CONCEPT_FALLBACK
}

export function shareSummaryLines(
  receivables: readonly FinanceReceivable[],
  display: FinanceMoneyDisplay
): ShareSummaryLine[] {
  return receivables.map((receivable) => ({
    id: receivable.id,
    concept: receivableShareConcept(receivable),
    pendingLabel: formatFinanceMoney(receivablePending(receivable), {
      ...display,
      currency: receivable.currency,
    }),
  }))
}

/** The single debtor of a selection, or null when it mixes people. */
export function shareSelectionDebtor(
  receivables: readonly FinanceReceivable[]
): string | null {
  const debtors = [
    ...new Set(receivables.map((receivable) => receivable.debtorName.trim())),
  ]
  return debtors.length === 1 ? (debtors[0] ?? null) : null
}

export function debtorFirstName(debtorName: string): string {
  return debtorName.trim().split(/\s+/)[0] ?? debtorName.trim()
}

/** Why the selection cannot be shared yet, or null when it can. */
export function shareSelectionError(
  receivables: readonly FinanceReceivable[]
): string | null {
  if (receivables.length === 0) {
    return "Elige al menos un cobro."
  }
  if (receivables.length > MAX_RECEIVABLE_SHARE_ITEMS) {
    return `Máximo ${MAX_RECEIVABLE_SHARE_ITEMS} cobros por link.`
  }
  if (!shareSelectionDebtor(receivables)) {
    return "Los cobros deben ser de una misma persona."
  }
  return null
}

export function buildCreateReceivableShareBody({
  receivables,
  debtorName,
}: {
  receivables: readonly FinanceReceivable[]
  debtorName: string
}): ShareSelectionResult {
  const selectionError = shareSelectionError(receivables)
  if (selectionError) {
    return { ok: false, error: selectionError }
  }

  const parsed = receivableShareSchema.safeParse({ debtorName })
  if (!parsed.success) {
    const [issue] = parsed.error.issues
    if (!issue) {
      throw new Error("receivableShareSchema failed without a reported issue")
    }
    return { ok: false, error: issue.message }
  }

  return {
    ok: true,
    body: {
      receivableIds: receivables.map((receivable) => receivable.id),
      debtorName: parsed.data.debtorName,
    },
  }
}

/** Host and path with the middle of the token hidden: `personalos.app/c/k7Qp…X2aZ`. */
export function maskShareUrl(url: string): string {
  if (!URL.canParse(url)) {
    return url
  }
  const parsed = new URL(url)

  const token = parsed.pathname.split("/").filter(Boolean).pop()
  if (!token || token.length <= MASKED_TOKEN_EDGE * 2) {
    return `${parsed.host}${parsed.pathname}`
  }

  const masked = `${token.slice(0, MASKED_TOKEN_EDGE)}…${token.slice(-MASKED_TOKEN_EDGE)}`
  return `${parsed.host}${parsed.pathname.replace(token, masked)}`
}

type WhatsAppShareInput = {
  url: string
  debtorName: string
  count: number
  pendingLabel: string
}

export function whatsAppShareMessage({
  url,
  debtorName,
  count,
  pendingLabel,
}: WhatsAppShareInput): string {
  const countLabel = count === 1 ? "1 cobro" : `${count} cobros`
  return [
    `Hola ${debtorFirstName(debtorName)} \u{1F44B}`,
    "",
    `Te comparto el detalle de lo que me debes (${countLabel}) \u{1F9FE}`,
    `\u{1F4B0} Pendiente: *${pendingLabel}*`,
    "",
    `\u{1F449} ${url}`,
    "",
    `Ahí puedes ver cada cobro y lo que ya has abonado. ¡Gracias! \u{1F64C}`,
  ].join("\n")
}

export function whatsAppShareHref(input: WhatsAppShareInput): string {
  return `${WHATSAPP_SHARE_URL}?text=${encodeURIComponent(whatsAppShareMessage(input))}`
}
