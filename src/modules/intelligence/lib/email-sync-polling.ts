import type { AiEmailSyncProgress } from "@/src/modules/intelligence/types/intelligence.types"

const RETRY_INTERVAL_MS = 30_000
const ACTIVE_SYNC_INTERVAL_MS = 5_000

type EmailSyncPollingInput = {
  connected: boolean
  lastSyncErrorCode?: string | null
  initialSyncCompletedAt?: string | null
  syncInProgress?: boolean
  syncProgress?: Pick<AiEmailSyncProgress, "status" | "errorCode"> | null
}

function isRetryableFailure({
  lastSyncErrorCode,
  syncProgress,
}: EmailSyncPollingInput): boolean {
  if (lastSyncErrorCode) {
    return true
  }
  if (syncProgress?.status === "failed") {
    return true
  }
  return (
    syncProgress?.status === "scheduled" &&
    syncProgress.errorCode === "classification_failed"
  )
}

/** Espera entre revalidaciones del panel según el estado de la sincronización. */
export function resolveEmailSyncRefetchInterval(
  input: EmailSyncPollingInput | undefined
): number | false {
  if (!input?.connected) {
    return false
  }
  if (isRetryableFailure(input)) {
    return RETRY_INTERVAL_MS
  }
  if (input.syncInProgress) {
    return ACTIVE_SYNC_INTERVAL_MS
  }
  if (!input.initialSyncCompletedAt) {
    return ACTIVE_SYNC_INTERVAL_MS
  }
  return false
}
