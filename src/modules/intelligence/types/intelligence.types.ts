import type { components } from "@/src/config/api-contract/api-schema"

type AiSchemas = components["schemas"]

/** Nombres del cliente para los tipos que publica el contrato del back. */
export type AiRole = AiSchemas["AiRoleUserResponseDto"]["role"]
type AiEmailSyncProgressContract = AiSchemas["AiEmailSyncProgressResponseDto"]

/** El DTO del back ya publica esta fase; el swagger versionado aún no la enumera. */
export type AiEmailSyncProgress = Omit<AiEmailSyncProgressContract, "phase"> & {
  phase: AiEmailSyncProgressContract["phase"] | "classifying"
}
export type AiEmailOAuthDiagnostics = AiSchemas["AiEmailDiagnosticsResponseDto"]
export type AiEmailMessageSummary =
  AiSchemas["AiEmailMessageSummaryResponseDto"]
export type AiEmailMessageStatus = AiEmailMessageSummary["processingStatus"]
export type AiEmailMessagesPage = AiSchemas["AiEmailMessagePageResponseDto"]
export type AiEmailMessageDetail = AiSchemas["AiEmailMessageResponseDto"]
export type AiDatasetSummary = AiSchemas["AiDatasetResponseDto"]
export type AiReviewQueueItem = AiSchemas["AiReviewQueueItemResponseDto"]
export type AiReviewStatus = AiReviewQueueItem["status"]
export type AiReviewVerification =
  AiSchemas["AiReviewItemVerificationResponseDto"]
export type AiReviewGroup = AiSchemas["AiReviewGroupResponseDto"]
export type AiReviewGroupsPage = AiSchemas["AiReviewGroupsPageResponseDto"]
export type AiReviewQueuePage = AiSchemas["AiReviewQueueResponseDto"]
export type AiReviewGroupVerdict =
  AiSchemas["CreateReviewGroupVerificationDto"]["verdict"]
export type AiReviewGroupVerificationResult =
  AiSchemas["AiReviewGroupVerificationResultResponseDto"]
type AiReviewSelectionVerificationContract =
  AiSchemas["CreateReviewSelectionVerificationDto"]
export type AiReviewSelectionVerificationInput = Omit<
  AiReviewSelectionVerificationContract,
  "verdict"
> & {
  verdict: Extract<
    AiReviewSelectionVerificationContract["verdict"],
    "CONFIRMED" | "CORRECTED"
  >
}
export type AiReviewSelectionVerificationResult =
  AiSchemas["AiReviewSelectionVerificationResponseDto"]
export type AiAnalysisRunSummary = AiSchemas["AiAnalysisRunResponseDto"]
export type AiConsent = AiSchemas["AiConsentResponseDto"]
export type AiRoleRow = AiSchemas["AiRoleUserResponseDto"]

/** La respuesta real existe en el servicio, pero el DTO OpenAPI del back no la publica todavía. */
export type AiRunComparison = {
  comparable: boolean
  warning: string | null
  first: AiAnalysisRunSummary
  second: AiAnalysisRunSummary
  deltas: Record<string, number | null> | null
}

/**
 * El contrato no describe la respuesta de `GET /intelligence/email/usage`.
 * Los campos son los que devuelve el servicio; hueco del contrato (back#263).
 */
export type EmailUsageBucket = {
  calls: number
  inputTokens: number
  outputTokens: number
  costUsd: number
}

export type EmailUsageDay = EmailUsageBucket & { day: string }
export type EmailUsageHour = EmailUsageBucket & { hour: number }
export type EmailUsageBank = EmailUsageBucket & { bank: string }
export type EmailUsageType = EmailUsageBucket & { type: string }

export type EmailUsageCostStatus = "OK" | "ALERT" | "PAUSED"

export type EmailUsageSummary = {
  range: { days: number; from: string; to: string }
  totals: EmailUsageBucket & { succeeded: number; failed: number }
  byDay: EmailUsageDay[]
  byHour: EmailUsageHour[]
  byBank: EmailUsageBank[]
  byType: EmailUsageType[]
  caps: {
    perMinute: number
    initial: { limit: number; remaining: number }
    daily: { limitTokens: number; usedTokens: number }
    globalCost: {
      limitUsd: number
      usedUsd: number
      alertRatio: number
      status: EmailUsageCostStatus
    }
  }
}

type ContractField<Value> = Exclude<Value, undefined>

type AiEmailConnection = AiSchemas["AiEmailConnectionResponseDto"]

/**
 * El contrato solo exige `connected`; la pantalla lee estos campos cuando la
 * cuenta estÃ¡ conectada. El alias local los declara sin agregarlos al contrato.
 */
type ConnectedEmailConnection = Omit<AiEmailConnection, "syncProgress"> & {
  connected: true
  emailAddress: ContractField<AiEmailConnection["emailAddress"]>
  initialSyncCompletedAt: ContractField<
    AiEmailConnection["initialSyncCompletedAt"]
  >
  lastRecoverySyncAt: ContractField<AiEmailConnection["lastRecoverySyncAt"]>
  lastSyncedAt: ContractField<AiEmailConnection["lastSyncedAt"]>
  lastSyncErrorCode: ContractField<AiEmailConnection["lastSyncErrorCode"]>
  requiresReconnect: ContractField<AiEmailConnection["requiresReconnect"]>
  syncInProgress: ContractField<AiEmailConnection["syncInProgress"]>
  /** El contrato de #382 los devuelve; el DTO OpenAPI todavía no los describe. */
  importStartAt: string | null
  senderFilter: string | null
  syncProgress: AiEmailSyncProgress | null
}

type DisconnectedEmailConnection = AiEmailConnection & { connected: false }

export type IntelligenceDashboard = Omit<
  AiSchemas["AiEmailDashboardResponseDto"],
  "connection"
> & {
  connection: ConnectedEmailConnection | DisconnectedEmailConnection
}

/**
 * El back acepta `relevance` y `notes`, pero el contrato todavÃ­a no los
 * describe; el cliente los declara aquÃ­. Hueco del contrato, no de la web.
 */
export type AiHumanVerificationInput =
  AiSchemas["CreateHumanVerificationDto"] & {
    relevance?: boolean
    notes?: string
  }

/**
 * El contrato publica `templateFingerprint` como objeto y no describe
 * `relevance`; el back los recibe como string nullable y booleano.
 */
export type AiReviewGroupVerificationInput = Omit<
  AiSchemas["CreateReviewGroupVerificationDto"],
  "templateFingerprint"
> & {
  templateFingerprint: string | null
  relevance?: boolean
}
