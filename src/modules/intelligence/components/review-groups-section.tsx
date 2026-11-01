"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ReviewGroupBatchSheet } from "@/src/modules/intelligence/components/review-group-batch-sheet"
import { INTELLIGENCE_SHEET_KEYS } from "@/src/modules/intelligence/constants/sheet-keys"
import { useReviewGroups } from "@/src/modules/intelligence/hooks/use-review-groups"
import {
  canBatchReviewGroup,
  countLabel,
  reviewGroupBatchResultLines,
  reviewGroupKey,
} from "@/src/modules/intelligence/review-groups"
import type {
  AiReviewGroup,
  AiReviewGroupVerificationInput,
  AiReviewGroupVerificationResult,
} from "@/src/modules/intelligence/types/intelligence.types"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
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
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import { AlertCircle, Layers3, RotateCcw, Tags } from "lucide-react"

type ReviewGroupsSectionProps = {
  enabled: boolean
}

type AppliedBatch = {
  groupKey: string
  verification: AiReviewGroupVerificationResult
}

export function ReviewGroupsSection({ enabled }: ReviewGroupsSectionProps) {
  const { groupsQuery, batchMutation } = useReviewGroups(enabled)
  const {
    open: sheetOpen,
    sheetId,
    setOpen: setSheetOpen,
  } = useSheetParam(INTELLIGENCE_SHEET_KEYS.reviewGroup)
  const [appliedBatch, setAppliedBatch] = useState<AppliedBatch | null>(null)
  const groups = useMemo(
    () => groupsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [groupsQuery.data?.pages]
  )
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = groupsQuery
  const selectedGroup =
    groups.find((group) => reviewGroupKey(group) === sheetId) ?? null
  const sheetVerification =
    appliedBatch !== null && appliedBatch.groupKey === sheetId
      ? appliedBatch.verification
      : null
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    if (!sheetOpen || groupsQuery.isPending) {
      return
    }
    if (selectedGroup || sheetVerification) {
      return
    }
    setSheetOpen(false)
  }, [
    groupsQuery.isPending,
    selectedGroup,
    setSheetOpen,
    sheetOpen,
    sheetVerification,
  ])

  function openGroup(group: AiReviewGroup) {
    setAppliedBatch(null)
    setSheetOpen(true, reviewGroupKey(group))
  }

  function closeSheet(open: boolean) {
    if (batchMutation.isPending) {
      return
    }
    if (!open) {
      setAppliedBatch(null)
    }
    setSheetOpen(open)
  }

  async function applyBatch(input: AiReviewGroupVerificationInput) {
    try {
      const verification = await batchMutation.mutateAsync(input)
      setAppliedBatch({ groupKey: reviewGroupKey(input), verification })
      appToast.success({
        text1: "Lote verificado",
        text2: reviewGroupBatchResultLines(verification).join(" · "),
      })
    } catch (error) {
      appToast.error({
        text1: "No se pudo aplicar el lote",
        text2: error instanceof Error ? error.message : "Inténtalo otra vez.",
      })
    }
  }

  if (!enabled) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      {groupsQuery.isPending ? (
        <div className="flex flex-col gap-2 p-2" aria-label="Cargando grupos">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : groupsQuery.isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No se pudieron cargar los grupos</EmptyTitle>
            <EmptyDescription>
              Tu correo ya importado se conserva.
            </EmptyDescription>
          </EmptyHeader>
          <Button type="button" onClick={() => void groupsQuery.refetch()}>
            <RotateCcw data-icon="inline-start" /> Reintentar
          </Button>
        </Empty>
      ) : groups.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers3 aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No hay grupos pendientes</EmptyTitle>
            <EmptyDescription>
              Los correos nuevos aparecerán aquí agrupados por remitente y
              plantilla.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {groups.map((group) => (
            <ReviewGroupRow
              key={reviewGroupKey(group)}
              group={group}
              onTag={() => openGroup(group)}
            />
          ))}
          <InfiniteListSentinel
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={loadMore}
          />
        </>
      )}

      <ReviewGroupBatchSheet
        open={sheetOpen}
        onOpenChange={closeSheet}
        group={selectedGroup}
        result={sheetVerification}
        pending={batchMutation.isPending}
        pendingVerdict={
          batchMutation.isPending ? batchMutation.variables?.verdict : undefined
        }
        onApply={(input) => void applyBatch(input)}
      />
    </div>
  )
}

function ReviewGroupRow({
  group,
  onTag,
}: {
  group: AiReviewGroup
  onTag: () => void
}) {
  const canBatch = canBatchReviewGroup(group)

  return (
    <SummaryItem
      title={group.fromAddress}
      wrapTitle
      description={
        <span className="block">
          {countLabel(group.total, "correo", "correos")}
          {group.sampleSubjects.length
            ? ` · ${group.sampleSubjects.join(" · ")}`
            : ""}
        </span>
      }
      wrapDescription
      icon={Layers3}
      onPress={canBatch ? onTag : undefined}
      showChevron={canBatch}
      trailing={
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap justify-end gap-1">
            <Badge variant="secondary">
              {countLabel(group.pending, "pendiente", "pendientes")}
            </Badge>
            {group.pendingHoldout > 0 ? (
              <Badge variant="warning">
                {countLabel(group.pendingHoldout, "HOLDOUT", "HOLDOUT")}
              </Badge>
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onTag}
            disabled={!canBatch}
          >
            <Tags data-icon="inline-start" /> Etiquetar
          </Button>
          {canBatch ? null : (
            <span className="text-xs text-muted-foreground">
              Solo HOLDOUT: revisa uno a uno
            </span>
          )}
        </div>
      }
    />
  )
}
