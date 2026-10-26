"use client"

import { useMemo, useState } from "react"
import { useAiEvidence } from "@/src/modules/intelligence/hooks/use-ai-evidence"
import { shortMessageId } from "@/src/modules/intelligence/message-id"
import type {
  AiHumanVerificationInput,
  AiReviewQueueItem,
} from "@/src/modules/intelligence/types/intelligence.types"
import { INTELLIGENCE_SHEET_KEYS } from "@/src/modules/intelligence/constants/sheet-keys"
import { ReviewSheet } from "@/src/modules/intelligence/components/review-sheet"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { appToast } from "@/src/shared/lib/app-toast"
import { formatDateTime } from "@/src/shared/lib/date-format"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import {
  AlertCircle,
  Check,
  Clock3,
  Mail,
  Pencil,
  RotateCcw,
} from "lucide-react"

type AiEvidenceSectionProps = {
  enabled: boolean
  view: "review" | "runs"
  onOpenMessage: (messageId: string) => void
}

type ReviewPartitionFilter = "ALL" | "TRAIN" | "VALIDATION" | "HOLDOUT"

export function AiEvidenceSection({
  enabled,
  view,
  onOpenMessage,
}: AiEvidenceSectionProps) {
  const [partitionFilter, setPartitionFilter] =
    useState<ReviewPartitionFilter>("ALL")
  const { reviewQueueQuery, runsQuery, verifyMutation } = useAiEvidence(
    enabled,
    view,
    partitionFilter
  )
  const review = useSheetParam(INTELLIGENCE_SHEET_KEYS.review)
  const messages = useMemo(
    () => reviewQueueQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [reviewQueueQuery.data?.pages]
  )
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = reviewQueueQuery
  const reviewCounts = reviewQueueQuery.data?.pages[0]?.counts
  const reviewedMessage = messages.find(
    (message) => message.id === review.sheetId
  )

  async function submitVerification(
    messageId: string,
    input: AiHumanVerificationInput
  ) {
    try {
      await verifyMutation.mutateAsync({ messageId, input })
      appToast.success({ text1: "Verificación guardada" })
      review.setOpen(false)
    } catch (error) {
      appToast.error({
        text1: "No se pudo guardar la verificación",
        text2: error instanceof Error ? error.message : "Inténtalo otra vez.",
      })
    }
  }

  if (!enabled) {
    return null
  }

  if (view === "runs") {
    return (
      <div className="flex flex-col gap-2">
        {runsQuery.isPending ? (
          <div className="flex flex-col gap-2 p-2" aria-label="Cargando runs">
            <Skeleton className="h-14 w-full" />
          </div>
        ) : runsQuery.isError ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No se pudieron cargar las ejecuciones</EmptyTitle>
              <EmptyDescription>
                Inténtalo de nuevo en unos momentos.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : runsQuery.data?.length ? (
          runsQuery.data.map((run, index) => (
            <SummaryItem
              key={run.id}
              title={`${run.mode} · ${run.status}`}
              description={`Pipeline ${run.pipelineVersion} · observaciones ${run.observationSequence} · verificaciones ${run.verificationSequence}`}
              icon={Clock3}
              value={
                run.completedAt ? formatDateTime(run.completedAt) : "En curso"
              }
              isLast={index === runsQuery.data!.length - 1}
            />
          ))
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Clock3 aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Aún no hay ejecuciones</EmptyTitle>
              <EmptyDescription>
                Aparecerán aquí cuando se ejecute un análisis.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {reviewQueueQuery.isPending ? (
        <div className="flex flex-wrap gap-2" aria-label="Cargando filtros">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ) : reviewQueueQuery.isError ? null : (
        <ToggleGroup
          value={[partitionFilter]}
          onValueChange={(next) => {
            const selected = next[0]
            if (
              selected === "ALL" ||
              selected === "TRAIN" ||
              selected === "VALIDATION" ||
              selected === "HOLDOUT"
            ) {
              setPartitionFilter(selected)
            }
          }}
          variant="outline"
          size="sm"
          aria-label="Filtrar correos por partición"
          className="w-full flex-wrap justify-start"
        >
          <ToggleGroupItem value="ALL" className="h-8 gap-2 rounded-full px-3">
            Todos <Badge variant="secondary">{reviewCounts?.all ?? 0}</Badge>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="TRAIN"
            className="h-8 gap-2 rounded-full px-3"
          >
            Entrenamiento{" "}
            <Badge variant="secondary">{reviewCounts?.TRAIN ?? 0}</Badge>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="VALIDATION"
            className="h-8 gap-2 rounded-full px-3"
          >
            Validación{" "}
            <Badge variant="secondary">{reviewCounts?.VALIDATION ?? 0}</Badge>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="HOLDOUT"
            className="h-8 gap-2 rounded-full px-3"
          >
            Holdout{" "}
            <Badge variant="secondary">{reviewCounts?.HOLDOUT ?? 0}</Badge>
          </ToggleGroupItem>
        </ToggleGroup>
      )}

      <div className="flex flex-col gap-2">
        {reviewQueueQuery.isPending ? (
          <div
            className="flex flex-col gap-2 p-2"
            aria-label="Cargando cola de revisión"
          >
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : reviewQueueQuery.isError ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No se pudo cargar la cola</EmptyTitle>
              <EmptyDescription>
                Tu correo ya importado se conserva.
              </EmptyDescription>
            </EmptyHeader>
            <Button
              type="button"
              onClick={() => void reviewQueueQuery.refetch()}
            >
              <RotateCcw data-icon="inline-start" /> Reintentar
            </Button>
          </Empty>
        ) : messages.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Check aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>La cola está al día</EmptyTitle>
              <EmptyDescription>
                Los mensajes nuevos aparecerán aquí para revisión.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {messages.map((message) => (
              <ReviewMessageRow
                key={message.id}
                message={message}
                onOpenMessage={onOpenMessage}
                onReview={() => review.setOpen(true, message.id)}
              />
            ))}
            <InfiniteListSentinel
              hasNextPage={Boolean(hasNextPage)}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  void fetchNextPage()
                }
              }}
            />
          </>
        )}
      </div>

      <ReviewSheet
        open={review.open}
        onOpenChange={review.setOpen}
        messageId={review.sheetId ?? null}
        partition={reviewedMessage?.partition}
        pendingVerdict={
          verifyMutation.isPending
            ? verifyMutation.variables?.input.verdict
            : undefined
        }
        onSubmit={submitVerification}
      />
    </div>
  )
}

function ReviewMessageRow({
  message,
  onOpenMessage,
  onReview,
}: {
  message: AiReviewQueueItem
  onOpenMessage: (messageId: string) => void
  onReview: () => void
}) {
  return (
    <SummaryItem
      title={message.subject || "(sin asunto)"}
      wrapTitle
      description={`${message.fromAddress} · ${formatDateTime(message.receivedAt)} · #${shortMessageId(message.id)}`}
      wrapDescription
      icon={Mail}
      onPress={() => onOpenMessage(message.id)}
      showChevron
      trailing={
        <div className="flex flex-col items-end gap-2">
          <Badge
            variant={message.partition === "HOLDOUT" ? "warning" : "secondary"}
          >
            {message.partition}
          </Badge>
          <Button type="button" size="sm" variant="outline" onClick={onReview}>
            <Pencil data-icon="inline-start" /> Revisar
          </Button>
        </div>
      }
    />
  )
}
