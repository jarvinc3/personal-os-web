import {
  ROUTE_LABELS,
  SEMANTIC_TYPE_LABELS,
} from "@/src/modules/intelligence/review-labels"

const METHOD_LABELS: Record<string, string> = {
  KNOWLEDGE: "Conocimiento guardado",
  DETERMINISTIC: "Parser determinista",
  MODEL: "Modelo con validación",
}

const UNKNOWN_METHOD_LABEL = "Método desconocido"

type RecordValue = Record<string, unknown>

function asRecord(value: unknown): RecordValue | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as RecordValue
}

function isRouteKey(value: string): value is keyof typeof ROUTE_LABELS {
  return value in ROUTE_LABELS
}

function isSemanticTypeKey(
  value: string
): value is keyof typeof SEMANTIC_TYPE_LABELS {
  return value in SEMANTIC_TYPE_LABELS
}

export function classificationRouteLabel(payload: unknown): string {
  const route = asRecord(payload)?.route
  if (typeof route !== "string" || route === "NONE") {
    return "Sin dominio"
  }
  return isRouteKey(route) ? ROUTE_LABELS[route] : route
}

export function classificationTypeLabel(payload: unknown): string {
  const label = asRecord(asRecord(payload)?.label)
  if (!label) {
    return "sin tipo"
  }
  const semanticType = label.semanticType
  if (typeof semanticType !== "string") {
    return "sin tipo"
  }
  return isSemanticTypeKey(semanticType)
    ? SEMANTIC_TYPE_LABELS[semanticType]
    : semanticType
}

function describeMethod(method: unknown): string {
  if (typeof method !== "string") {
    return UNKNOWN_METHOD_LABEL
  }
  return METHOD_LABELS[method] ?? UNKNOWN_METHOD_LABEL
}

function describeConfidence(confidence: unknown): string {
  if (typeof confidence !== "number") {
    return "confianza desconocida"
  }
  return `confianza ${Math.round(confidence * 100)}%`
}

function describeRelevance(label: RecordValue | null): string | null {
  if (typeof label?.relevance !== "boolean") {
    return null
  }
  return label.relevance ? "relevante" : "no relevante"
}

function describeTransaction(label: RecordValue | null): string | null {
  const transaction = asRecord(label?.transaction)
  if (!transaction) {
    return null
  }
  return Object.entries(transaction)
    .map(([key, item]) => `${key}: ${String(item)}`)
    .join(", ")
}

function describeKnowledgeUsed(value: unknown): string {
  if (!Array.isArray(value)) {
    return ""
  }
  return value
    .map((item) => {
      const entry = asRecord(item)
      if (!entry) {
        return null
      }
      return [entry.scope, entry.knowledgeType, entry.knowledgeKey]
        .filter((part) => typeof part === "string")
        .join(" ")
    })
    .filter(Boolean)
    .join(", ")
}

/** Describe una clasificación automática con el mismo texto que pinta la hoja. */
export function describeClassification(payload: unknown): string {
  const value = asRecord(payload) ?? {}
  const label = asRecord(value.label)
  const used = describeKnowledgeUsed(value.knowledgeUsed)
  const parts = [
    describeMethod(value.method),
    describeConfidence(value.confidence),
    describeRelevance(label),
    typeof value.provider === "string" ? value.provider : null,
    typeof value.model === "string" ? value.model : null,
    describeTransaction(label),
    used ? `conocimiento: ${used}` : "sin conocimiento aplicado",
  ]
  return parts.filter(Boolean).join(" · ")
}
