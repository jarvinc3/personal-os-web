import {
  ROUTE_LABELS,
  SEMANTIC_TYPE_LABELS,
} from "@/src/modules/intelligence/review-labels"
import type {
  EmailSignal,
  EmailSignalEvidence,
  EmailSignalStatus,
} from "@/src/modules/intelligence/types/signal.types"

export const SIGNAL_STATUS_LABELS: Record<EmailSignalStatus, string> = {
  DETECTED: "Detectada",
  VALIDATED: "Validada",
  ROUTED: "Enrutada",
  CONSUMED: "Consumida",
  DISMISSED: "Descartada",
  SUPERSEDED: "Reemplazada",
  FAILED: "Fallida",
}

const SIGNAL_TYPE_LABELS: Record<string, string> = {
  "FINANCE.TRANSACTION_DETECTED": "Transacción detectada en Finanzas",
}

const CLASSIFICATION_PATH_LABELS: Record<string, string> = {
  KNOWLEDGE: "Conocimiento guardado",
  DETERMINISTIC: "Parser determinista",
  MODEL: "Modelo con validación",
}

const EVIDENCE_SOURCE_LABELS: Record<string, string> = {
  EMAIL_CLASSIFICATION: "Clasificación del correo",
}

const PENDING_CLASSIFICATION_STATUSES = new Set(["INGESTED", "QUEUED"])
const FAILED_CLASSIFICATION_STATUS = "FAILED"

/**
 * El contrato no busca señales por correo: las lista y las entrega por id. El
 * back arma el id de la señal como "email-" más el id del mensaje en
 * packages/intelligence/src/email/ai-email-classification.service.ts
 * (`const signalId = ...`), así que la web reconstruye ese id en vez de pedir
 * la lista y filtrarla por el correo.
 */
export function emailSignalId(messageId: string): string {
  return `email-${messageId}`
}

export function signalTypeLabel(type: string): string {
  return SIGNAL_TYPE_LABELS[type] ?? type
}

export function signalStatusLabel(status: EmailSignalStatus): string {
  return SIGNAL_STATUS_LABELS[status]
}

export function formatSignalConfidence(
  confidence: number | null | undefined
): string {
  if (typeof confidence !== "number" || !Number.isFinite(confidence)) {
    return "Sin confianza registrada"
  }
  return `Confianza ${Math.round(confidence * 100)}%`
}

export type SignalRouteRow = {
  route: string
  title: string
  description: string
}

/** Una señal guarda todas las rutas del correo en el payload; cada una se lee como una fila. */
export function signalRouteRows(signal: EmailSignal): SignalRouteRow[] {
  const routes = Array.isArray(signal.payload.routes)
    ? signal.payload.routes.filter(
        (route): route is string => typeof route === "string"
      )
    : []
  const semanticType =
    typeof signal.payload.semanticType === "string"
      ? signal.payload.semanticType
      : null
  const typeLabel = semanticType ? semanticTypeLabel(semanticType) : "Sin tipo"

  return routes.map((route) => ({
    route,
    title: `Ruta ${routeLabel(route)}`,
    description: `Tipo: ${typeLabel}`,
  }))
}

export function evidenceSourceLabel(sourceType: string): string {
  return EVIDENCE_SOURCE_LABELS[sourceType] ?? sourceType
}

export function evidenceRuleLabel(evidence: EmailSignalEvidence): string {
  const path = evidence.excerpt.classificationPath
  const provider = evidence.excerpt.inferenceProvider
  const model = evidence.excerpt.inferenceModel
  const pathLabel =
    typeof path === "string" ? (CLASSIFICATION_PATH_LABELS[path] ?? path) : null
  const modelLabel = [provider, model]
    .filter((part): part is string => typeof part === "string")
    .join(" ")
  const rule = [pathLabel, modelLabel].filter(Boolean).join(" · ")

  return rule || "Sin regla registrada"
}

export type MissingSignalKind = "pending" | "failed" | "none"

export type MissingSignalState = {
  kind: MissingSignalKind
  title: string
  description: string
}

/** Un correo sin señal no es un hueco: la clasificación pendiente se explica aparte. */
export function missingSignalState(
  processingStatus: string
): MissingSignalState {
  if (PENDING_CLASSIFICATION_STATUSES.has(processingStatus)) {
    return {
      kind: "pending",
      title: "Clasificación pendiente",
      description:
        "La inteligencia todavía no clasificó este correo. La señal aparecerá aquí cuando termine.",
    }
  }

  if (processingStatus === FAILED_CLASSIFICATION_STATUS) {
    return {
      kind: "failed",
      title: "La clasificación falló",
      description:
        "El correo no se pudo clasificar, así que no se publicó ninguna señal.",
    }
  }

  return {
    kind: "none",
    title: "Sin señal",
    description:
      "Este correo no originó una señal: no se detectó una operación para Finanzas.",
  }
}

function routeLabel(route: string): string {
  return route in ROUTE_LABELS
    ? ROUTE_LABELS[route as keyof typeof ROUTE_LABELS]
    : route
}

function semanticTypeLabel(semanticType: string): string {
  return semanticType in SEMANTIC_TYPE_LABELS
    ? SEMANTIC_TYPE_LABELS[semanticType as keyof typeof SEMANTIC_TYPE_LABELS]
    : semanticType
}
