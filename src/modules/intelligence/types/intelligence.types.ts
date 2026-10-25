export type AiRole = "USER" | "CONTRIBUTOR" | "ADMIN"

export type AiEmailSyncProgress = {
  status:
    "running" | "waiting" | "retrying" | "scheduled" | "completed" | "failed"
  phase: "bootstrap" | "incremental" | "recovery"
  attempt: number
  rateLimitRetryCount?: number
  processedThisRun: number
  importedThisRun: number
  batchSize?: number
  totalEstimate?: number
  retryAt?: number
  nextRunAt?: number
  errorCode?: string
  errorCategory?:
    "authorization" | "configuration" | "rate_limit" | "temporary" | "unknown"
  startedAt: string
  updatedAt: string
}

export type IntelligenceDashboard = {
  connection:
    | {
        connected: true
        emailAddress: string
        initialSyncCompletedAt: string | null
        syncInProgress: boolean
        syncProgress: AiEmailSyncProgress | null
        lastSyncedAt: string | null
        lastRecoverySyncAt: string | null
        lastSyncErrorCode: string | null
      }
    | { connected: false }
  counters: {
    importedMessages: number
    recentMessages: number
    bootstrapImportedMessages: number
  }
  receivedRange?: {
    firstMessageAt: string | null
    latestMessageAt: string | null
  }
  role: AiRole
}

export type AiEmailMessageSummary = {
  id: string
  receivedAt: string
  fromAddress: string
  fromDomain: string
  subject: string
  processingStatus: string
  contentFingerprint: string
}

export type AiEmailMessagesPage = {
  items: AiEmailMessageSummary[]
  nextCursor: string | null
  hasMore: boolean
}

export type AiEmailMessageDetail = AiEmailMessageSummary & {
  userId: string
  connectionId: string
  providerMessageId: string
  providerThreadId: string | null
  content: {
    rawBody: string | null
    sanitizedBody: string | null
    canonicalBody: string | null
    snippet: string | null
    retentionExpiresAt: string | null
  } | null
  provenance: {
    observations: Array<{
      sequence: string
      runId: string | null
      knowledgeType: string
      knowledgeKey: string
      proposedScope: string
      payload: unknown
      createdAt: string
    }>
    verifications: Array<{
      sequence: string
      verifierRole: AiRole
      verdict: "CONFIRMED" | "CORRECTED" | "REJECTED"
      correctedPayload: unknown
      notes: string | null
      isGroundTruth: boolean
      createdAt: string
    }>
  }
}

export type AiDatasetSummary = {
  id: string
  name: "EMAIL_V1"
  partitions: { TRAIN: number; VALIDATION: number; HOLDOUT: number }
}

export type AiReviewQueueItem = AiEmailMessageSummary & {
  partition: "TRAIN" | "VALIDATION" | "HOLDOUT"
}

export type AiReviewQueuePage = {
  items: AiReviewQueueItem[]
  counts: {
    all: number
    TRAIN: number
    VALIDATION: number
    HOLDOUT: number
  }
  nextCursor: string | null
  hasMore: boolean
}

import type {
  SemanticRoute,
  SemanticType,
  TransactionDirection,
  TransactionKind,
} from "@/src/modules/intelligence/review-labels"

export type AiHumanVerificationInput = {
  verdict: "CONFIRMED" | "CORRECTED" | "REJECTED"
  relevance?: boolean
  semanticType?: SemanticType
  routes?: SemanticRoute[]
  transaction?: {
    kind?: TransactionKind
    amount?: number
    currency?: string
    transactionDate?: string
    direction?: TransactionDirection
    merchant?: string
    bankReference?: string
    last4?: string
  }
  notes?: string
}

export type AiAnalysisRunSummary = {
  id: string
  datasetId: string
  mode: "ANALYZE_ONLY" | "EVALUATE" | "IMPORT"
  status: "RUNNING" | "COMPLETED" | "FAILED"
  observationSequence: string
  verificationSequence: string
  projectorVersion: string
  policyVersion: string
  pipelineVersion: string
  detectorVersion: string | null
  promptVersion: string | null
  schemaVersion: string | null
  configuration: unknown
  metrics: unknown
  startedAt: string
  completedAt: string | null
  error: string | null
}

export type AiConsent = {
  contributeToGlobalKnowledge: boolean
  contributionConsentAt: string
}

export type AiRoleRow = {
  id: string
  email: string
  fullName: string
  role: AiRole
  grantedAt: string | null
  updatedAt: string | null
}
