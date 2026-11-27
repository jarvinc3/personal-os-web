"use client"

import { ChevronRightIcon, Mail, Pencil } from "lucide-react"

import { shortMessageId } from "@/src/modules/intelligence/message-id"
import {
  describeVerificationPayload,
  SEMANTIC_TYPE_LABELS,
} from "@/src/modules/intelligence/review-labels"
import type {
  AiReviewQueueItem,
  AiReviewStatus,
  AiReviewVerification,
} from "@/src/modules/intelligence/types/intelligence.types"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { formatDateTime } from "@/src/shared/lib/date-format"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"

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
  const formatLocale = useFormatLocale()
  const reviewed = message.status !== "PENDING"
  const verification = message.verification
  const semanticType = message.semanticType
    ? SEMANTIC_TYPE_LABELS[message.semanticType]
    : "Sin tipo"
  const confidence =
    message.confidence === null
      ? "Sin dato"
      : `${Math.round(message.confidence * 100)} %`
  return (
    <div className="flex w-full items-stretch overflow-hidden rounded-2xl">
      <Item
        render={
          <button type="button" onClick={() => onOpenMessage(message.id)} />
        }
        className="min-w-0 flex-1"
      >
        <ItemMedia variant="icon">
          <Mail />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-2 break-words">
            {message.subject || "(sin asunto)"}
          </ItemTitle>
          <ItemDescription className="line-clamp-none text-xs break-words whitespace-normal">
            <span className="flex flex-col gap-0.5">
              <span>
                {message.fromAddress} ·{" "}
                {formatDateTime(message.receivedAt, formatLocale)} · #
                {shortMessageId(message.id)}
              </span>
              <span>
                Tipo semántico: {semanticType} · Confianza: {confidence}
              </span>
              {verification ? (
                <span className="text-foreground">
                  {describeReviewVerification(verification, formatLocale)}
                </span>
              ) : null}
            </span>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        </ItemActions>
      </Item>
      <div className="flex shrink-0 items-center pr-2">
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
      </div>
    </div>
  )
}

function describeReviewVerification(
  verification: AiReviewVerification,
  locale: string
): string {
  const labels = verification.labels
    ? describeVerificationPayload(verification.labels)
    : null
  return [
    labels,
    verification.notes,
    `Verificado ${formatDateTime(verification.createdAt, locale)}`,
  ]
    .filter(Boolean)
    .join(" · ")
}
