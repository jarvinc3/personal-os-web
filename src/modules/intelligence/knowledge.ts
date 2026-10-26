import {
  RELEVANCE_LABELS,
  ROUTE_LABELS,
  SEMANTIC_TYPE_LABELS,
  TRANSACTION_KIND_LABELS,
} from "@/src/modules/intelligence/review-labels"
import type {
  KnowledgeItem,
  KnowledgeLabel,
  KnowledgePromotedBy,
  KnowledgeState,
  KnowledgeType,
} from "@/src/modules/intelligence/types/knowledge.types"

export const KNOWLEDGE_TYPE_LABELS: Record<KnowledgeType, string> = {
  EMAIL_SENDER: "Remitente",
  EMAIL_DOMAIN: "Dominio",
  EMAIL_TEMPLATE: "Plantilla",
  ENTITY: "Entidad",
  RELATION: "Relación",
  USER_MAPPING: "Mapeo de usuario",
}

export const KNOWLEDGE_STATE_LABELS: Record<KnowledgeState, string> = {
  OBSERVED: "Observado",
  STABLE: "Estable",
  REVIEW_REQUIRED: "Pendiente de revisión",
  BLOCKED: "Bloqueado",
}

export const KNOWLEDGE_PROMOTED_BY_LABELS: Record<
  Exclude<KnowledgePromotedBy, null>,
  string
> = {
  AUTO: "Promovido automáticamente",
  CONTRIBUTOR: "Promovido por un colaborador",
  ADMIN: "Promovido por un administrador",
}

export type KnowledgeStateGroup = {
  state: KnowledgeState
  title: string
  description: string
  items: KnowledgeItem[]
}

const KNOWLEDGE_STATE_GROUPS: ReadonlyArray<
  Omit<KnowledgeStateGroup, "items">
> = [
  {
    state: "REVIEW_REQUIRED",
    title: "Pendientes de revisión",
    description: "No se aplican hasta que un administrador los revise.",
  },
  {
    state: "STABLE",
    title: "Promovidos",
    description: "Conocimiento global activo.",
  },
  {
    state: "BLOCKED",
    title: "Bloqueados",
    description: "Revertidos; no se aplican.",
  },
  {
    state: "OBSERVED",
    title: "Observados",
    description: "Observaciones sin promoción.",
  },
]

/**
 * The key of a GLOBAL sender is an identifier, not shared knowledge: it is
 * never shown even if the API sends one. GLOBAL only exposes domain and
 * template keys.
 */
export function knowledgeKey(item: KnowledgeItem): string | null {
  if (item.scope === "GLOBAL" && item.knowledgeType === "EMAIL_SENDER") {
    return null
  }
  const key = item.knowledgeKey.trim()
  return key.length > 0 ? key : null
}

export function knowledgeTitle(item: KnowledgeItem): string {
  return (
    knowledgeKey(item) ??
    KNOWLEDGE_TYPE_LABELS[item.knowledgeType] ??
    item.knowledgeType
  )
}

export function knowledgeLabelSummary(label?: KnowledgeLabel): string {
  if (!label) {
    return "Sin etiqueta"
  }
  const parts: string[] = []
  if (typeof label.relevance === "boolean") {
    parts.push(
      label.relevance ? RELEVANCE_LABELS.relevant : RELEVANCE_LABELS.irrelevant
    )
  }
  if (label.semanticType) {
    parts.push(SEMANTIC_TYPE_LABELS[label.semanticType] ?? label.semanticType)
  }
  const routes = (label.routes ?? []).map(
    (route) => ROUTE_LABELS[route] ?? route
  )
  if (routes.length > 0) {
    parts.push(routes.join(", "))
  }
  if (label.transaction?.kind) {
    parts.push(
      TRANSACTION_KIND_LABELS[label.transaction.kind] ?? label.transaction.kind
    )
  }
  return parts.length > 0 ? parts.join(" · ") : "Sin etiqueta"
}

export function knowledgeCountsLabel(item: KnowledgeItem): string {
  const parts = [
    `${item.messagesSeen} ${item.messagesSeen === 1 ? "correo" : "correos"}`,
  ]
  if (item.humanVerifiedCount > 0) {
    parts.push(
      `${item.humanVerifiedCount} ${
        item.humanVerifiedCount === 1 ? "verificación" : "verificaciones"
      }`
    )
  }
  if (item.scope === "GLOBAL") {
    parts.push(
      `${item.distinctUsers} ${
        item.distinctUsers === 1 ? "usuario" : "usuarios"
      }`
    )
  }
  return parts.join(" · ")
}

/**
 * Reads only the structural part of the label. Amounts, merchants, last4 and
 * bank references never reach this string, also for personal items.
 */
export function knowledgeDescription(item: KnowledgeItem): string {
  const parts = [
    KNOWLEDGE_TYPE_LABELS[item.knowledgeType] ?? item.knowledgeType,
    knowledgeLabelSummary(item.payload?.label),
    knowledgeCountsLabel(item),
  ]
  if (item.scope === "GLOBAL" && item.promotedBy) {
    parts.push(KNOWLEDGE_PROMOTED_BY_LABELS[item.promotedBy])
  }
  return parts.join(" · ")
}

export function canRevertKnowledge(item: KnowledgeItem): boolean {
  return item.scope === "GLOBAL" && item.state === "STABLE"
}

export function groupKnowledgeByState(
  items: readonly KnowledgeItem[]
): KnowledgeStateGroup[] {
  return KNOWLEDGE_STATE_GROUPS.flatMap((group) => {
    const groupItems = items.filter((item) => item.state === group.state)
    return groupItems.length > 0 ? [{ ...group, items: groupItems }] : []
  })
}

export function knowledgeExportFilename(exportedAt: string): string {
  const exportedDate = new Date(exportedAt)
  const day = Number.isNaN(exportedDate.getTime())
    ? "datos"
    : exportedDate.toISOString().slice(0, 10)
  return `conocimiento-personal-os-${day}.json`
}
