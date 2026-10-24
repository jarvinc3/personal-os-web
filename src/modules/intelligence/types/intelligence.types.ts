export type AiRole = "USER" | "CONTRIBUTOR" | "ADMIN"

export type IntelligenceDashboard = {
  connection:
    | {
        connected: true
        emailAddress: string
        initialSyncCompletedAt: string | null
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
