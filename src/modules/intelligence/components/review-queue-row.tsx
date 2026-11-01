"use client"

import { Mail, Pencil } from "lucide-react"

import { shortMessageId } from "@/src/modules/intelligence/message-id"
import { describeVerificationPayload } from "@/src/modules/intelligence/review-labels"
import type {
  AiReviewQueueItem,
  AiReviewStatus,
  AiReviewVerification,
} from "@/src/modules/intelligence/types/intelligence.types"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { formatDateTime } from "@/src/shared/lib/date-format"

const REVIEW_STATUS_LABELS: Record<AiReviewStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CORRECTED: "Corregido",
  REJECTED: "Rechazado",
}

const REVIEW_STATUS_BADGE: Record<
  AiReviewStatus,
  "secondary" | "success" | "info" | "danger"
> = {
  PENDING: "secondary",
  CONFIRMED: "success",
  CORRECTED: "info",
  REJECTED: "danger",
}

type ReviewQueueRowProps = {
  message: AiReviewQueueItem
  onOpenMessage: (messageId: string) => void
  onReview: () => void
}

/**
 * Una fila de la cola. En Revisados muestra la última verificación con sus
 * etiquetas o su motivo, y no ofrece volver a verificar.
 */
export function ReviewQueueRow({
  message,
  onOpenMessage,
  onReview,
}: ReviewQueueRowProps) {
  const reviewed = message.status !== "PENDING"
  const verification = message.verification
  return (
    <SummaryItem
      title={message.subject || "(sin asunto)"}
      wrapTitle
      description={
        <span className="flex flex-col gap-0.5">
          <span>
            {message.fromAddress} · {formatDateTime(message.receivedAt)} · #
            {shortMessageId(message.id)}
          </span>
          {verification ? (
            <span className="text-foreground">
              {describeReviewVerification(verification)}
            </span>
          ) : null}
        </span>
      }
      wrapDescription
      icon={Mail}
      onPress={() => onOpenMessage(message.id)}
      showChevron
      trailing={
        <div className="flex flex-col items-end gap-2">
          {reviewed ? (
            <Badge variant={REVIEW_STATUS_BADGE[message.status]}>
              {REVIEW_STATUS_LABELS[message.status]}
            </Badge>
          ) : null}
          <Badge
            variant={message.partition === "HOLDOUT" ? "warning" : "secondary"}
          >
            {message.partition}
          </Badge>
          {reviewed ? null : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onReview}
            >
              <Pencil data-icon="inline-start" /> Revisar
            </Button>
          )}
        </div>
      }
    />
  )
}

function describeReviewVerification(
  verification: AiReviewVerification
): string {
  const labels = verification.labels
    ? describeVerificationPayload(verification.labels)
    : null
  return [
    labels,
    verification.notes,
    `Verificado ${formatDateTime(verification.createdAt)}`,
  ]
    .filter(Boolean)
    .join(" · ")
}
