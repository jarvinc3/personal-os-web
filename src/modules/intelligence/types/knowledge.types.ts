import type {
  SemanticRoute,
  SemanticType,
  TransactionKind,
} from "@/src/modules/intelligence/review-labels"

export type KnowledgeScope = "USER" | "GLOBAL"

export type KnowledgeType =
  | "EMAIL_SENDER"
  | "EMAIL_DOMAIN"
  | "EMAIL_TEMPLATE"
  | "ENTITY"
  | "RELATION"
  | "USER_MAPPING"

export type KnowledgeState =
  "OBSERVED" | "STABLE" | "REVIEW_REQUIRED" | "BLOCKED"

export type KnowledgePromotedBy = "AUTO" | "CONTRIBUTOR" | "ADMIN" | null

export type KnowledgeTransaction = {
  kind?: TransactionKind
}

export type KnowledgeLabel = {
  relevance?: boolean
  semanticType?: SemanticType
  routes?: SemanticRoute[]
  transaction?: KnowledgeTransaction
}

export type KnowledgeItem = {
  id: string
  scope: KnowledgeScope
  userId: string | null
  knowledgeType: KnowledgeType
  knowledgeKey: string
  state: KnowledgeState
  payload: { label: KnowledgeLabel }
  messagesSeen: number
  rejectedMessages: number
  distinctUsers: number
  humanVerifiedCount: number
  promotedBy: KnowledgePromotedBy
  projectorVersion: string
  policyVersion: string
  normalizerVersion: string
  sanitizerVersion: string
  firstSeenAt: string
  lastSeenAt: string
  updatedAt: string
}

export type KnowledgeExplorer = {
  personal: KnowledgeItem[]
  global: KnowledgeItem[]
}

export type KnowledgeExport = {
  exportedAt: string
  knowledge: KnowledgeItem[]
}

export type KnowledgeDeletion = {
  deleted: true
  deletedMessages: number
  detachedVerifications: number
  detachedObservations: number
}
