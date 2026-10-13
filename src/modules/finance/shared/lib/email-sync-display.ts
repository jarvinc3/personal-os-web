export const RUNNING_SYNC_REFETCH_MS = 3_000

export function hasRunningEmailSync(
  mailboxes: { sources: { logs?: { status: string }[] }[] }[]
): boolean {
  return mailboxes.some((mailbox) =>
    mailbox.sources.some((source) =>
      (source.logs ?? []).some((log) => log.status === "RUNNING")
    )
  )
}

export function syncLogStatusLabel(status: string): string {
  switch (status) {
    case "SUCCESS":
      return "OK"
    case "FAILED":
      return "Error"
    case "RUNNING":
      return "En curso"
    default:
      return status
  }
}

export function emailOutcomeLabel(outcome: string): string {
  switch (outcome) {
    case "IMPORTED":
      return "Importado"
    case "PENDING_ASSIGNMENT":
      return "Por asignar"
    case "PENDING_AMOUNT":
      return "Falta el monto"
    case "SKIPPED_NOT_TX":
      return "No es movimiento"
    case "SKIPPED_DUPLICATE":
      return "Duplicado"
    case "FAILED_NON_RETRYABLE":
      return "Descartado"
    default:
      return outcome
  }
}

/** Messages the sync skipped because a movement already existed. */
export function countSkippedDuplicates(
  messages: readonly { outcome: string }[]
): number {
  return messages.filter((message) => message.outcome === "SKIPPED_DUPLICATE")
    .length
}

export function syncLogBadgeVariant(
  status: string
): "secondary" | "destructive" | "outline" {
  if (status === "FAILED") {
    return "destructive"
  }
  if (status === "SUCCESS") {
    return "secondary"
  }
  return "outline"
}
