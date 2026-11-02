import type {
  components,
  operations,
} from "@/src/config/api-contract/api-schema"

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
export type AiAnalysisRunSummary = AiSchemas["AiAnalysisRunResponseDto"]
export type AiConsent = AiSchemas["AiConsentResponseDto"]
export type AiRoleRow = AiSchemas["AiRoleUserResponseDto"]

export type AiRunComparison =
  operations["AiEvidenceController_compare"]["responses"]["201"]["content"]["application/json"]

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
