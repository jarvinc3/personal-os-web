import type { operations } from "@/src/config/api-contract/api-schema"
import type { AiEmailMessageStatus } from "@/src/modules/intelligence/types/intelligence.types"

/** Estados de análisis que puede tener un correo (`processingStatus`). */
export const MESSAGE_STATUS_LABELS = {
  INGESTED: "Recibido",
  QUEUED: "En cola",
  CLASSIFYING: "Clasificando",
  PROCESSED: "Procesado",
  REVIEW_REQUIRED: "En revisión",
  FAILED: "Falló",
  DISCARDED: "Descartado",
} as const satisfies Record<AiEmailMessageStatus, string>

export type MessageStatus = AiEmailMessageStatus
export const ALL_MESSAGE_STATUSES = "ALL" as const
export type MessageStatusFilter = MessageStatus | typeof ALL_MESSAGE_STATUSES

type EmailMessagesStatusFilter = NonNullable<
  operations["AiIntelligenceController_messages"]["parameters"]["query"]
>["status"]

/**
 * Estados que la lista admite como filtro. `CLASSIFYING` y `DISCARDED` existen
 * en el correo pero el API no los filtra, así que no se ofrecen.
 */
export const MESSAGE_STATUS_FILTERS = [
  "INGESTED",
  "QUEUED",
  "PROCESSED",
  "REVIEW_REQUIRED",
  "FAILED",
] as const satisfies readonly EmailMessagesStatusFilter[]
