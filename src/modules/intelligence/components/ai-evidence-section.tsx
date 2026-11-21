"use client"

import { useCallback, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  Eraser,
  Focus,
  GitCompareArrows,
  Inbox,
  ListFilter,
  RotateCcw,
  Settings2,
  X,
} from "lucide-react"

import { useAiEvidence } from "@/src/modules/intelligence/hooks/use-ai-evidence"
import type {
  AiHumanVerificationInput,
  AiReviewSelectionVerificationInput,
} from "@/src/modules/intelligence/types/intelligence.types"
import { shortMessageId } from "@/src/modules/intelligence/message-id"
import { INTELLIGENCE_SHEET_KEYS } from "@/src/modules/intelligence/constants/sheet-keys"
import { ReviewSheet } from "@/src/modules/intelligence/components/review-sheet"
import { ReviewFocusSheet } from "@/src/modules/intelligence/components/review-focus-sheet"
import { ReviewFiltersSheet } from "@/src/modules/intelligence/components/review-filters-sheet"
import { ReviewSelectionSheet } from "@/src/modules/intelligence/components/review-selection-sheet"
import { ReviewSettingsSheet } from "@/src/modules/intelligence/components/review-settings-sheet"
import { ReviewQueueRow } from "@/src/modules/intelligence/components/review-queue-row"
import {
  ROUTE_LABELS,
  SEMANTIC_TYPE_LABELS,
} from "@/src/modules/intelligence/review-labels"
import {
  REVIEW_SELECTION_MAX_MESSAGES,
  reviewSelectionResultLines,
  toggleReviewSelection,
} from "@/src/modules/intelligence/review-selection"
import {
  activeReviewFilters,
  clearReviewFilters,
  formatReviewDay,
  readReviewQueueFilters,
  removeReviewFilter,
  reviewQueueApiQuery,
  reviewQueueFiltersHref,
  type ActiveReviewFilter,
  type ReviewQueueFilters,
  type ReviewQueueTab,
} from "@/src/modules/intelligence/review-queue-filters"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { InfiniteListErrorFooter } from "@/src/shared/components/feedback/infinite-list-error-footer"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { Checkbox } from "@/src/shared/components/ui/checkbox"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { appToast } from "@/src/shared/lib/app-toast"
import { resolveInfiniteListErrorState } from "@/src/shared/lib/infinite-list-error"
import {
  analysisRunModeLabel,
  analysisRunStatusLabel,
} from "@/src/modules/intelligence/analysis-labels"
import { formatDateTime } from "@/src/shared/lib/date-format"
import {
  SHEET_ID_QUERY_KEY,
  SHEET_QUERY_KEY,
} from "@/src/shared/lib/sheet-navigation"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"

const TAB_OPTIONS: {
  value: ReviewQueueTab
  label: string
  icon: typeof Inbox
}[] = [
  { value: "pending", label: "Pendientes", icon: Inbox },
  { value: "reviewed", label: "Revisados", icon: CheckCircle2 },
]

const PARTITION_LABELS: Record<
  Exclude<ReviewQueueFilters["partition"], "ALL">,
  string
> = {
  TRAIN: "Entrenamiento",
  VALIDATION: "Validación",
  HOLDOUT: "Holdout",
}

const STATUS_LABELS: Record<
  Exclude<ReviewQueueFilters["status"], "ALL">,
  string
> = {
  CONFIRMED: "confirmado",
  CORRECTED: "corregido",
  REJECTED: "rechazado",
}

type AiEvidenceSectionProps = {
  enabled: boolean
  view: "review" | "runs"
  onOpenMessage: (messageId: string) => void
}

export function AiEvidenceSection({
  enabled,
  view,
  onOpenMessage,
}: AiEvidenceSectionProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const formatLocale = useFormatLocale()
  const filters = readReviewQueueFilters(searchParams)
  const activeFilters = activeReviewFilters(filters)
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([])
  const {
    reviewQueueQuery,
    runsQuery,
    verifyMutation,
    verifySelectionMutation,
    evaluateMutation,
    compareMutation,
  } = useAiEvidence(enabled, view, reviewQueueApiQuery(filters))
  const review = useSheetParam(INTELLIGENCE_SHEET_KEYS.review)
  const focus = useSheetParam(INTELLIGENCE_SHEET_KEYS.focus)
  const filtersSheet = useSheetParam(INTELLIGENCE_SHEET_KEYS.reviewFilters)
  const selectionSheet = useSheetParam(INTELLIGENCE_SHEET_KEYS.reviewSelection)
  const settingsSheet = useSheetParam(INTELLIGENCE_SHEET_KEYS.reviewSettings)
  const messages = useMemo(
    () => reviewQueueQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [reviewQueueQuery.data?.pages]
  )
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = reviewQueueQuery
  const reviewQueueErrorState = resolveInfiniteListErrorState({
    hasError: reviewQueueQuery.isError,
    itemCount: messages.length,
  })
  const reviewedMessage = messages.find(
    (message) => message.id === review.sheetId
  )
  const selectedMessages = messages.filter((message) =>
    selectedMessageIds.includes(message.id)
  )
  const selectedHoldoutCount = selectedMessages.filter(
    (message) => message.partition === "HOLDOUT"
  ).length
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const changeFilters = useCallback(
    (patch: Partial<ReviewQueueFilters>) => {
      setSelectedMessageIds([])
      setSelectionMode(false)
      const normalizedPatch =
        patch.tab === "pending" ? { ...patch, status: "ALL" as const } : patch
      const href = reviewQueueFiltersHref(
        pathname,
        searchParams.toString(),
        normalizedPatch
      )
      if (href) {
        router.replace(href, { scroll: false })
      }
    },
    [pathname, router, searchParams, setSelectedMessageIds, setSelectionMode]
  )

  // Aplicar cierra la hoja en la misma navegación: un `router.back()` normal
  // volvería a los filtros anteriores al abrirla.
  const applyFilters = useCallback(
    (patch: Partial<ReviewQueueFilters>) => {
      setSelectedMessageIds([])
      setSelectionMode(false)
      const base = new URLSearchParams(searchParams.toString())
      base.delete(SHEET_QUERY_KEY)
      base.delete(SHEET_ID_QUERY_KEY)
      const normalizedPatch =
        patch.tab === "pending" ? { ...patch, status: "ALL" as const } : patch
      const href = reviewQueueFiltersHref(
        pathname,
        base.toString(),
        normalizedPatch
      )
      const query = base.toString()
      router.replace(href ?? (query ? `${pathname}?${query}` : pathname), {
        scroll: false,
      })
    },
    [pathname, router, searchParams, setSelectedMessageIds, setSelectionMode]
  )

  function clearFilters() {
    changeFilters(clearReviewFilters(filters))
  }

  function removeFilter(filter: ActiveReviewFilter) {
    changeFilters(removeReviewFilter(filters, filter))
  }

  async function verifyMessage({
    messageId,
    input,
    onVerified,
  }: {
    messageId: string
    input: AiHumanVerificationInput
    onVerified?: () => void
  }) {
    try {
      await verifyMutation.mutateAsync({ messageId, input })
      appToast.success({ text1: "Verificación guardada" })
      onVerified?.()
    } catch (error) {
      appToast.error({
        text1: "No se pudo guardar la verificación",
        text2: error instanceof Error ? error.message : "Inténtalo otra vez.",
      })
    }
  }

  function submitVerification(
    messageId: string,
    input: AiHumanVerificationInput
  ) {
    void verifyMessage({
      messageId,
      input,
      onVerified: () => review.setOpen(false),
    })
  }

  async function verifySelection(input: AiReviewSelectionVerificationInput) {
    try {
      const result = await verifySelectionMutation.mutateAsync(input)
      setSelectedMessageIds([])
      setSelectionMode(false)
      selectionSheet.setOpen(false)
      appToast.success({
        text1: "Selección verificada",
        text2: reviewSelectionResultLines(result).join(" · "),
      })
    } catch (error) {
      appToast.error({
        text1: "No se pudo verificar la selección",
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
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={evaluateMutation.isPending}
            onClick={() =>
              evaluateMutation.mutate(undefined, {
                onSuccess: () =>
                  appToast.success({ text1: "Evaluación HOLDOUT completada" }),
                onError: () =>
                  appToast.error({ text1: "No se pudo evaluar HOLDOUT" }),
              })
            }
          >
            {evaluateMutation.isPending ? "Evaluando…" : "Evaluar HOLDOUT"}
          </Button>
          {selectedRunIds.length === 2 ? (
            <Button
              type="button"
              variant="outline"
              disabled={compareMutation.isPending}
              onClick={() =>
                compareMutation.mutate({
                  firstRunId: selectedRunIds[0],
                  secondRunId: selectedRunIds[1],
                })
              }
            >
              {compareMutation.isPending
                ? "Comparando…"
                : "Comparar seleccionados"}
            </Button>
          ) : null}
        </div>
        {compareMutation.data ? (
          <section aria-live="polite" className="rounded-lg border p-3 text-sm">
            <h3 className="font-medium">
              {compareMutation.data.comparable
                ? "Análisis comparables"
                : "Comparación no comparable"}
            </h3>
            {compareMutation.data.warning ? (
              <p className="text-muted-foreground">
                {compareMutation.data.warning}
              </p>
            ) : null}
            {compareMutation.data.deltas ? (
              <dl className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(compareMutation.data.deltas).map(
                  ([key, value]) => (
                    <div key={key}>
                      <dt className="text-muted-foreground">
                        {metricLabel(key)}
                      </dt>
                      <dd>
                        {typeof value !== "number"
                          ? "—"
                          : `${value > 0 ? "+" : ""}${(value * 100).toFixed(1)} pp`}
                      </dd>
                    </div>
                  )
                )}
              </dl>
            ) : null}
          </section>
        ) : null}
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
            <div
              key={run.id}
              className="flex items-center gap-2 rounded-lg border px-2"
            >
              <div className="min-w-0 flex-1">
                <SummaryItem
                  key={run.id}
                  title={`${analysisRunModeLabel(run.mode)} · ${analysisRunStatusLabel(run.status)}`}
                  description={`Proceso ${run.pipelineVersion} · ${run.observationSequence} observaciones · ${run.verificationSequence} verificaciones`}
                  icon={Clock3}
                  value={
                    run.completedAt
                      ? formatDateTime(run.completedAt)
                      : "En curso"
                  }
                  isLast={index === runsQuery.data!.length - 1}
                />
                {run.mode === "EVALUATE" &&
                run.metrics &&
                typeof run.metrics === "object" ? (
                  <p className="px-2 pb-2 text-xs text-muted-foreground">
                    {formatRunMetrics(run.metrics)}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Button
                  type="button"
                  variant={
                    selectedRunIds.includes(run.id) ? "secondary" : "ghost"
                  }
                  size="sm"
                  aria-pressed={selectedRunIds.includes(run.id)}
                  aria-label={`Seleccionar análisis ${run.id} para comparar`}
                  onClick={() =>
                    setSelectedRunIds((current) =>
                      current.includes(run.id)
                        ? current.filter((id) => id !== run.id)
                        : current.length < 2
                          ? [...current, run.id]
                          : [current[1], run.id]
                    )
                  }
                >
                  {selectedRunIds.includes(run.id) ? (
                    <Check aria-hidden="true" />
                  ) : (
                    <>
                      <GitCompareArrows aria-hidden="true" />
                      Comparar
                    </>
                  )}
                </Button>
                {run.mode === "EVALUATE" && run.status === "COMPLETED" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={evaluateMutation.isPending}
                    onClick={() =>
                      evaluateMutation.mutate(undefined, {
                        onSuccess: () =>
                          appToast.success({
                            text1: "Nuevo análisis HOLDOUT creado",
                          }),
                      })
                    }
                  >
                    <RotateCcw aria-hidden="true" />
                    Reejecutar
                  </Button>
                ) : null}
              </div>
            </div>
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
      <SegmentedControl
        ariaLabel="Correos pendientes o revisados"
        value={filters.tab}
        onChange={(tab) => changeFilters({ tab })}
        options={TAB_OPTIONS}
        fullWidth
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => filtersSheet.setOpen(true)}
        >
          <ListFilter data-icon="inline-start" /> Filtros
          {activeFilters.length ? (
            <Badge variant="secondary">{activeFilters.length}</Badge>
          ) : null}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => settingsSheet.setOpen(true)}
        >
          <Settings2 data-icon="inline-start" /> Ajustes
        </Button>
      </div>

      {activeFilters.length ? (
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label="Filtros activos"
        >
          {activeFilters.map((filter) => {
            const label = describeActiveFilter(filter, formatLocale)
            return (
              <Button
                key={`${filter.kind}:${"value" in filter ? filter.value : "on"}`}
                type="button"
                size="sm"
                variant="secondary"
                aria-label={`Quitar filtro ${label}`}
                onClick={() => removeFilter(filter)}
              >
                {label}
                <X className="size-3.5" aria-hidden="true" />
              </Button>
            )
          })}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearFilters}
          >
            <Eraser data-icon="inline-start" /> Limpiar
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        {messages.length && filters.tab === "pending" ? (
          <div className="flex flex-wrap justify-between gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => focus.setOpen(true)}
            >
              <Focus data-icon="inline-start" /> Modo foco
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={selectionMode ? "secondary" : "outline"}
                aria-pressed={selectionMode}
                onClick={() => {
                  if (selectionMode) {
                    setSelectedMessageIds([])
                  }
                  setSelectionMode(!selectionMode)
                }}
              >
                {selectionMode ? (
                  <X data-icon="inline-start" />
                ) : (
                  <Check data-icon="inline-start" />
                )}
                {selectionMode ? "Cancelar selección" : "Seleccionar"}
              </Button>
              {selectionMode ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => selectionSheet.setOpen(true)}
                  disabled={selectedMessageIds.length === 0}
                >
                  <CheckCircle2 data-icon="inline-start" /> Verificar
                  {selectedMessageIds.length
                    ? ` (${selectedMessageIds.length})`
                    : " selección"}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        {reviewQueueQuery.isPending ? (
          <div
            className="flex flex-col gap-2 p-2"
            aria-label="Cargando cola de revisión"
          >
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : reviewQueueErrorState === "full" ? (
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
          <ReviewQueueEmpty
            filters={filters}
            activeFilters={activeFilters}
            onClear={clearFilters}
          />
        ) : (
          <>
            {messages.map((message) => {
              const selected = selectedMessageIds.includes(message.id)
              const row = (
                <ReviewQueueRow
                  message={message}
                  onOpenMessage={onOpenMessage}
                  onReview={() => review.setOpen(true, message.id)}
                />
              )
              return selectionMode ? (
                <div key={message.id} className="flex items-start gap-2">
                  <Checkbox
                    checked={selected}
                    disabled={
                      selectedMessageIds.length >=
                        REVIEW_SELECTION_MAX_MESSAGES && !selected
                    }
                    aria-label={`Seleccionar correo ${shortMessageId(message.id)}`}
                    className="mt-5"
                    onCheckedChange={() =>
                      setSelectedMessageIds((current) =>
                        toggleReviewSelection(
                          current,
                          message.id,
                          REVIEW_SELECTION_MAX_MESSAGES
                        )
                      )
                    }
                  />
                  <div className="min-w-0 flex-1">{row}</div>
                </div>
              ) : (
                <div key={message.id}>{row}</div>
              )
            })}
            {reviewQueueErrorState === "inline" ? (
              <InfiniteListErrorFooter
                title="No se pudieron cargar más correos"
                isRetrying={isFetchingNextPage}
                onRetry={loadMore}
              />
            ) : (
              <InfiniteListSentinel
                hasNextPage={Boolean(hasNextPage)}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={loadMore}
              />
            )}
          </>
        )}
      </div>

      <ReviewSheet
        open={review.open}
        onOpenChange={review.setOpen}
        messageId={review.sheetId ?? null}
        partition={reviewedMessage?.partition}
        pendingVerdict={
          verifyMutation.isPending &&
          verifyMutation.variables?.messageId === review.sheetId
            ? verifyMutation.variables?.input.verdict
            : undefined
        }
        onSubmit={submitVerification}
      />

      <ReviewFocusSheet
        open={focus.open}
        onOpenChange={focus.setOpen}
        messages={messages}
        hasNextPage={Boolean(hasNextPage)}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={loadMore}
        pending={
          verifyMutation.isPending && verifyMutation.variables
            ? {
                messageId: verifyMutation.variables.messageId,
                verdict: verifyMutation.variables.input.verdict,
              }
            : undefined
        }
        onSubmit={(messageId, input) =>
          void verifyMessage({ messageId, input })
        }
      />

      <ReviewFiltersSheet
        open={filtersSheet.open}
        onOpenChange={filtersSheet.setOpen}
        filters={filters}
        onApply={applyFilters}
      />
      <ReviewSelectionSheet
        open={selectionSheet.open}
        onOpenChange={selectionSheet.setOpen}
        messageIds={selectedMessageIds}
        holdoutCount={selectedHoldoutCount}
        pending={verifySelectionMutation.isPending}
        pendingVerdict={
          verifySelectionMutation.isPending
            ? verifySelectionMutation.variables?.verdict
            : undefined
        }
        onApply={(input) => void verifySelection(input)}
      />
      <ReviewSettingsSheet
        open={settingsSheet.open}
        onOpenChange={settingsSheet.setOpen}
      />
    </div>
  )
}

function metricLabel(key: string) {
  const labels: Record<string, string> = {
    transactionRecall: "Recall transaccional",
    precision: "Precisión",
    deterministicCoverage: "Cobertura determinista",
    modelFallbackRate: "Fallback al modelo",
    unknownRate: "Desconocidos",
  }
  return labels[key] ?? key
}

function formatRunMetrics(metrics: unknown) {
  if (!metrics || typeof metrics !== "object") {
    return ""
  }
  const values = metrics as Record<string, unknown>
  return [
    "transactionRecall",
    "precision",
    "deterministicCoverage",
    "modelFallbackRate",
    "unknownRate",
  ]
    .map(
      (key) =>
        `${metricLabel(key)} ${typeof values[key] === "number" ? `${((values[key] as number) * 100).toFixed(1)}%` : "—"}`
    )
    .join(" · ")
}

function ReviewQueueEmpty({
  filters,
  activeFilters,
  onClear,
}: {
  filters: ReviewQueueFilters
  activeFilters: ActiveReviewFilter[]
  onClear: () => void
}) {
  const formatLocale = useFormatLocale()

  if (activeFilters.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListFilter aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Sin correos con estos filtros</EmptyTitle>
          <EmptyDescription>
            {describeActiveFilters(activeFilters, formatLocale)}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" variant="outline" onClick={onClear}>
            <Eraser data-icon="inline-start" /> Limpiar filtros
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return filters.tab === "reviewed" ? (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckCircle2 aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Aún no hay correos revisados</EmptyTitle>
        <EmptyDescription>
          Los correos que confirmes, corrijas o rechaces aparecerán aquí con su
          estado.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ) : (
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
  )
}

function describeActiveFilters(
  activeFilters: ActiveReviewFilter[],
  locale: string
): string {
  const parts = activeFilters.map((filter) =>
    describeActiveFilter(filter, locale)
  )
  return `Filtros activos: ${parts.join(" · ")}`
}

function describeActiveFilter(
  filter: ActiveReviewFilter,
  locale: string
): string {
  switch (filter.kind) {
    case "subject":
      return `Asunto: ${filter.value}`
    case "sender":
      return `Remitente: ${filter.value}`
    case "dateFrom":
      return `Desde ${formatReviewDay(filter.value, locale)}`
    case "dateTo":
      return `Hasta ${formatReviewDay(filter.value, locale)}`
    case "order":
      return filter.value === "IMPACT"
        ? "Mayor impacto"
        : "Más recientes primero"
    case "semanticType":
      return `Tipo: ${SEMANTIC_TYPE_LABELS[filter.value]}`
    case "route":
      return `Dominio: ${ROUTE_LABELS[filter.value]}`
    case "confidenceMin":
      return `Confianza ≥ ${Math.round(filter.value * 100)} %`
    case "confidenceMax":
      return `Confianza ≤ ${Math.round(filter.value * 100)} %`
    case "partition":
      return `Conjunto: ${PARTITION_LABELS[filter.value]}`
    case "status":
      return `Estado: ${STATUS_LABELS[filter.value]}`
    case "uncertain":
      return "Solo inciertos"
  }
}
