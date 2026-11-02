import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { INTELLIGENCE_SHEET_KEYS } from "@/src/modules/intelligence/constants"

export type TransactionSignalTrace = {
  signalId: string | null
  sourceEmailMessageId: string | null
}

function readId(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null
}

export function transactionSignalTrace(
  metadata: Record<string, unknown> | null | undefined
): TransactionSignalTrace {
  return {
    signalId: readId(metadata?.signalId),
    sourceEmailMessageId: readId(metadata?.sourceEmailMessageId),
  }
}

export function sourceEmailDetailHref(messageId: string): string {
  const params = new URLSearchParams({
    sheet: INTELLIGENCE_SHEET_KEYS.message,
    sheetId: messageId,
  })
  return `${APP_ROUTES.app.intelligence}?${params.toString()}`
}
