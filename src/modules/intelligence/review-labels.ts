import { z } from "zod"
import type { AiHumanVerificationInput } from "./types/intelligence.types"

// Valores de CreateHumanVerificationDto en el OpenAPI de personal-os-back#217.
export const SEMANTIC_TYPE_LABELS = {
  FIN_TRANSACTION: "Transacción",
  PURCHASE_RECEIPT: "Recibo / factura",
  SUBSCRIPTION_BILLING: "Cobro de suscripción",
  FIN_STATEMENT_NOTICE: "Estado de cuenta",
  FIN_ACCOUNT_NOTICE: "Aviso de producto financiero",
  SECURITY_OTP: "Código de verificación",
  SECURITY_ALERT: "Alerta de seguridad",
  TECH_NOTIFICATION: "Notificación técnica",
  JOB: "Empleo",
  CALENDAR_EVENT: "Cita / evento",
  MARKETING: "Publicidad / newsletter",
  SOCIAL: "Red social",
  OTHER: "Otro (requiere nota)",
} as const

export const ROUTE_LABELS = {
  FINANCE: "Finanzas",
  SUBSCRIPTIONS: "Suscripciones",
  CALENDAR: "Agenda",
  SECURITY: "Seguridad",
} as const

export const TRANSACTION_KIND_LABELS = {
  TRANSACTION: "Transacción",
  PENDING: "Pendiente",
  NOT_TRANSACTION: "No es transacción",
} as const

export const TRANSACTION_DIRECTION_LABELS = {
  DEBIT: "Débito",
  CREDIT: "Crédito",
  TRANSFER: "Transferencia",
} as const

export const RELEVANCE_LABELS = {
  relevant: "Relevante",
  irrelevant: "No relevante",
} as const

export function reviewSelectLabel<T extends Record<string, string>>(
  value: string | null,
  labels: T,
  placeholder: string
): string {
  return value && value in labels ? labels[value as keyof T] : placeholder
}

export type SemanticType = keyof typeof SEMANTIC_TYPE_LABELS
export type SemanticRoute = keyof typeof ROUTE_LABELS
export type TransactionKind = keyof typeof TRANSACTION_KIND_LABELS
export type TransactionDirection = keyof typeof TRANSACTION_DIRECTION_LABELS

const semanticTypes = Object.keys(SEMANTIC_TYPE_LABELS) as SemanticType[]
const routes = Object.keys(ROUTE_LABELS) as SemanticRoute[]
const transactionKinds = Object.keys(
  TRANSACTION_KIND_LABELS
) as TransactionKind[]
const transactionDirections = Object.keys(
  TRANSACTION_DIRECTION_LABELS
) as TransactionDirection[]

export const reviewFormSchema = z
  .object({
    semanticType: z.enum(semanticTypes).or(z.literal("")),
    relevance: z.enum(["", "relevant", "irrelevant"]),
    routes: z.array(z.enum(routes)),
    kind: z.enum(transactionKinds).or(z.literal("")),
    amount: z.string(),
    currency: z.string(),
    transactionDate: z.string(),
    direction: z.enum(transactionDirections).or(z.literal("")),
    merchant: z.string().max(255),
    bankReference: z.string().max(255),
    last4: z.string(),
    notes: z.string().max(2000),
  })
  .superRefine((value, context) => {
    if (!value.semanticType) {
      context.addIssue({
        code: "custom",
        path: ["semanticType"],
        message: "Elige un tipo",
      })
    }
    if (value.semanticType === "OTHER" && !value.notes.trim()) {
      context.addIssue({
        code: "custom",
        path: ["notes"],
        message: "Añade una nota para Otro",
      })
    }
    if (value.semanticType === "FIN_TRANSACTION" && !value.kind) {
      context.addIssue({
        code: "custom",
        path: ["kind"],
        message: "Elige el tipo de transacción",
      })
    }
    if (
      (value.semanticType === "SECURITY_ALERT" &&
        value.relevance === "irrelevant") ||
      (value.semanticType === "SECURITY_OTP" && value.relevance === "relevant")
    ) {
      context.addIssue({
        code: "custom",
        path: ["relevance"],
        message: "La relevancia no corresponde al tipo",
      })
    }
    const hasTransaction =
      value.semanticType === "FIN_TRANSACTION" ||
      value.semanticType === "PURCHASE_RECEIPT" ||
      value.semanticType === "SUBSCRIPTION_BILLING"
    if (!hasTransaction) {
      return
    }

    if (
      value.amount &&
      (!Number.isFinite(Number(value.amount)) || !(Number(value.amount) > 0))
    ) {
      context.addIssue({
        code: "custom",
        path: ["amount"],
        message: "El monto debe ser positivo",
      })
    }
    if (
      value.currency &&
      !Intl.supportedValuesOf("currency").includes(value.currency.trim())
    ) {
      context.addIssue({
        code: "custom",
        path: ["currency"],
        message: "Usa una moneda ISO 4217",
      })
    }
    if (value.last4 && !/^\d{4}$/.test(value.last4)) {
      context.addIssue({
        code: "custom",
        path: ["last4"],
        message: "Escribe cuatro dígitos",
      })
    }
  })

export type ReviewFormValues = z.input<typeof reviewFormSchema>

export const REVIEW_FORM_DEFAULTS: ReviewFormValues = {
  semanticType: "",
  relevance: "",
  routes: [],
  kind: "",
  amount: "",
  currency: "",
  transactionDate: "",
  direction: "",
  merchant: "",
  bankReference: "",
  last4: "",
  notes: "",
}

export function buildCorrection(
  values: ReviewFormValues
): AiHumanVerificationInput {
  const value = reviewFormSchema.parse(values)
  const semanticType = value.semanticType as SemanticType
  const transactionAllowed =
    semanticType === "FIN_TRANSACTION" ||
    ((semanticType === "PURCHASE_RECEIPT" ||
      semanticType === "SUBSCRIPTION_BILLING") &&
      Boolean(
        value.amount ||
        value.currency ||
        value.transactionDate ||
        value.direction ||
        value.merchant.trim() ||
        value.bankReference.trim() ||
        value.last4
      ))

  return {
    verdict: "CORRECTED",
    semanticType,
    routes: value.routes,
    ...(value.relevance
      ? { relevance: value.relevance === "relevant" }
      : semanticType === "SECURITY_ALERT"
        ? { relevance: true }
        : semanticType === "SECURITY_OTP"
          ? { relevance: false }
          : {}),
    ...(transactionAllowed
      ? {
          transaction: {
            ...(semanticType === "FIN_TRANSACTION"
              ? { kind: value.kind as TransactionKind }
              : {}),
            ...(value.amount ? { amount: Number(value.amount) } : {}),
            ...(value.currency ? { currency: value.currency.trim() } : {}),
            ...(value.transactionDate
              ? { transactionDate: value.transactionDate }
              : {}),
            ...(value.direction ? { direction: value.direction } : {}),
            ...(value.merchant.trim()
              ? { merchant: value.merchant.trim() }
              : {}),
            ...(value.bankReference.trim()
              ? { bankReference: value.bankReference.trim() }
              : {}),
            ...(value.last4 ? { last4: value.last4 } : {}),
          },
        }
      : {}),
    ...(value.notes.trim() ? { notes: value.notes.trim() } : {}),
  }
}

export function describeVerificationPayload(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Sin etiquetas corregidas"
  }
  const value = payload as Record<string, unknown>
  const parts: string[] = []
  if (typeof value.relevance === "boolean") {
    parts.push(RELEVANCE_LABELS[value.relevance ? "relevant" : "irrelevant"])
  }
  if (
    typeof value.semanticType === "string" &&
    value.semanticType in SEMANTIC_TYPE_LABELS
  ) {
    parts.push(SEMANTIC_TYPE_LABELS[value.semanticType as SemanticType])
  }
  if (Array.isArray(value.routes)) {
    const names = value.routes
      .filter(
        (route): route is SemanticRoute =>
          typeof route === "string" && route in ROUTE_LABELS
      )
      .map((route) => ROUTE_LABELS[route])
    parts.push(names.length ? names.join(", ") : "Sin dominios")
  }
  if (value.transaction && typeof value.transaction === "object") {
    const transaction = value.transaction as Record<string, unknown>
    const details = [
      typeof transaction.kind === "string" &&
      transaction.kind in TRANSACTION_KIND_LABELS
        ? TRANSACTION_KIND_LABELS[transaction.kind as TransactionKind]
        : "Transacción",
      typeof transaction.amount === "number" ? String(transaction.amount) : "",
      typeof transaction.currency === "string" ? transaction.currency : "",
      typeof transaction.transactionDate === "string"
        ? transaction.transactionDate
        : "",
      typeof transaction.direction === "string" &&
      transaction.direction in TRANSACTION_DIRECTION_LABELS
        ? TRANSACTION_DIRECTION_LABELS[
            transaction.direction as TransactionDirection
          ]
        : "",
      typeof transaction.merchant === "string" ? transaction.merchant : "",
      typeof transaction.bankReference === "string"
        ? transaction.bankReference
        : "",
      typeof transaction.last4 === "string" ? `•••• ${transaction.last4}` : "",
    ].filter(Boolean)
    parts.push(details.join(" · "))
  }
  return parts.length ? parts.join(" · ") : "Sin etiquetas corregidas"
}
