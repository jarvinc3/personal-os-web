"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  Eraser,
  Focus,
  Inbox,
  ListFilter,
  RotateCcw,
  Search,
} from "lucide-react"

import { useAiEvidence } from "@/src/modules/intelligence/hooks/use-ai-evidence"
import type {
  AiHumanVerificationInput,
  AiReviewQueuePage,
} from "@/src/modules/intelligence/types/intelligence.types"
import { INTELLIGENCE_SHEET_KEYS } from "@/src/modules/intelligence/constants/sheet-keys"
import { ReviewSheet } from "@/src/modules/intelligence/components/review-sheet"
import { ReviewFocusSheet } from "@/src/modules/intelligence/components/review-focus-sheet"
import { ReviewFiltersSheet } from "@/src/modules/intelligence/components/review-filters-sheet"
import { ReviewQueueRow } from "@/src/modules/intelligence/components/review-queue-row"
import {
  activeReviewFilters,
  clearReviewFilters,
  formatReviewDay,
  isReviewQueuePartitionFilter,
  isReviewQueueStatusFilter,
  readReviewQueueFilters,
  reviewQueueApiQuery,
  reviewQueueFiltersHref,
  type ActiveReviewFilter,
  type ReviewQueueFilters,
  type ReviewQueuePartitionFilter,
  type ReviewQueueStatusFilter,
  type ReviewQueueTab,
} from "@/src/modules/intelligence/review-queue-filters"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Input } from "@/src/shared/components/ui/input"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { appToast } from "@/src/shared/lib/app-toast"
import { formatDateTime } from "@/src/shared/lib/date-format"
import {
  SHEET_ID_QUERY_KEY,
  SHEET_QUERY_KEY,
} from "@/src/shared/lib/sheet-navigation"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"

const SEARCH_DEBOUNCE_MS = 300

const TAB_OPTIONS: {
  value: ReviewQueueTab
  label: string
  icon: typeof Inbox
}[] = [
  { value: "pending", label: "Pendientes", icon: Inbox },
  { value: "reviewed", label: "Revisados", icon: CheckCircle2 },
]

const STATUS_OPTIONS: {
  value: ReviewQueueStatusFilter
  label: string
}[] = [
  { value: "ALL", label: "Todos" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "CORRECTED", label: "Corregidos" },
  { value: "REJECTED", label: "Rechazados" },
]

const PARTITION_OPTIONS: {
  value: ReviewQueuePartitionFilter
  label: string
}[] = [
  { value: "ALL", label: "Todos" },
  { value: "TRAIN", label: "Entrenamiento" },
  { value: "VALIDATION", label: "Validación" },
  { value: "HOLDOUT", label: "Holdout" },
]

const PARTITION_LABELS: Record<
  Exclude<ReviewQueuePartitionFilter, "ALL">,
  string
> = {
  TRAIN: "Entrenamiento",
  VALIDATION: "Validación",
  HOLDOUT: "Holdout",
}

const STATUS_LABELS: Record<Exclude<ReviewQueueStatusFilter, "ALL">, string> = {
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
  const [subjectDraft, setSubjectDraft] = useState(filters.subject)
  const [editingSubject, setEditingSubject] = useState(false)
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([])
  const subjectValue = editingSubject ? subjectDraft : filters.subject
  const {
    reviewQueueQuery,
    runsQuery,
    verifyMutation,
    evaluateMutation,
    compareMutation,
  } = useAiEvidence(enabled, view, reviewQueueApiQuery(filters))
  const review = useSheetParam(INTELLIGENCE_SHEET_KEYS.review)
  const focus = useSheetParam(INTELLIGENCE_SHEET_KEYS.focus)
  const filtersSheet = useSheetParam(INTELLIGENCE_SHEET_KEYS.reviewFilters)
  const messages = useMemo(
    () => reviewQueueQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [reviewQueueQuery.data?.pages]
  )
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = reviewQueueQuery
  const reviewCounts = reviewQueueQuery.data?.pages[0]?.counts
  const reviewedMessage = messages.find(
    (message) => message.id === review.sheetId
  )
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const changeFilters = useCallback(
    (patch: Partial<ReviewQueueFilters>) => {
      const href = reviewQueueFiltersHref(
        pathname,
        searchParams.toString(),
        patch
      )
      if (href) {
        router.replace(href, { scroll: false })
      }
    },
    [pathname, router, searchParams]
  )

  // Aplicar cierra la hoja en la misma navegación: un `router.back()` normal
  // volvería a los filtros anteriores al abrirla.
  const applyFilters = useCallback(
    (patch: Partial<ReviewQueueFilters>) => {
      const base = new URLSearchParams(searchParams.toString())
      base.delete(SHEET_QUERY_KEY)
      base.delete(SHEET_ID_QUERY_KEY)
      const href = reviewQueueFiltersHref(pathname, base.toString(), patch)
      const query = base.toString()
      router.replace(href ?? (query ? `${pathname}?${query}` : pathname), {
        scroll: false,
      })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (!editingSubject || subjectDraft.trim() === filters.subject) {
      return
    }
    const timer = window.setTimeout(() => {
      changeFilters({ subject: subjectDraft })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [editingSubject, subjectDraft, filters.subject, changeFilters])

  function startEditingSubject() {
    if (editingSubject) {
      return
    }
    setSubjectDraft(filters.subject)
    setEditingSubject(true)
  }

  function commitSubject() {
    setEditingSubject(false)
    changeFilters({ subject: subjectDraft })
  }

  function clearFilters() {
    setSubjectDraft("")
    setEditingSubject(false)
    changeFilters(clearReviewFilters(filters))
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
                ? "Runs comparables"
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
                        {value === null
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
              <Button
                type="button"
                variant={
                  selectedRunIds.includes(run.id) ? "secondary" : "ghost"
                }
                size="sm"
                aria-pressed={selectedRunIds.includes(run.id)}
                aria-label={`Seleccionar run ${run.id} para comparar`}
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
                  "Comparar"
                )}
              </Button>
              <div className="min-w-0 flex-1">
                <SummaryItem
                  key={run.id}
                  title={`${run.mode} · ${run.status}`}
                  description={`Pipeline ${run.pipelineVersion} · observaciones ${run.observationSequence} · verificaciones ${run.verificationSequence}`}
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
                            text1: "Nuevo run HOLDOUT creado",
                          }),
                      })
                    }
                  >
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

      {filters.tab === "reviewed" ? (
        <ToggleGroup
          value={[filters.status]}
          onValueChange={(next) => {
            const selected = next[0]
            if (isReviewQueueStatusFilter(selected)) {
              changeFilters({ status: selected })
            }
          }}
          variant="outline"
          size="sm"
          aria-label="Filtrar correos por estado de la última verificación"
          className="w-full flex-wrap justify-start"
        >
          {STATUS_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="h-8 gap-2 rounded-full px-3"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : null}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={filters.uncertain ? "secondary" : "outline"}
          aria-pressed={filters.uncertain}
          onClick={() => changeFilters({ uncertain: !filters.uncertain })}
        >
          Inciertos
        </Button>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={subjectValue}
            onFocus={startEditingSubject}
            onChange={(event) => setSubjectDraft(event.target.value)}
            onBlur={commitSubject}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                commitSubject()
                event.currentTarget.blur()
              }
              if (event.key === "Escape") {
                setSubjectDraft(filters.subject)
              }
            }}
            placeholder="Buscar"
            aria-label="Buscar por asunto"
            className="pl-9"
          />
        </div>
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
      </div>

      {activeFilters.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 text-xs wrap-break-word text-muted-foreground">
            {describeActiveFilters(activeFilters, formatLocale)}
          </span>
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

      <ReviewPartitionFilter
        value={filters.partition}
        counts={reviewCounts}
        showCounts={filters.tab === "pending" && Boolean(reviewCounts)}
        onChange={(partition) => changeFilters({ partition })}
      />

      <div className="flex flex-col gap-2">
        {messages.length && filters.tab === "pending" ? (
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => focus.setOpen(true)}
            >
              <Focus data-icon="inline-start" /> Modo foco
            </Button>
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
          <ReviewQueueEmpty
            filters={filters}
            activeFilters={activeFilters}
            onClear={clearFilters}
          />
        ) : (
          <>
            {messages.map((message) => (
              <ReviewQueueRow
                key={message.id}
                message={message}
                onOpenMessage={onOpenMessage}
                onReview={() => review.setOpen(true, message.id)}
              />
            ))}
            <InfiniteListSentinel
              hasNextPage={Boolean(hasNextPage)}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={loadMore}
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

function ReviewPartitionFilter({
  value,
  counts,
  showCounts,
  onChange,
}: {
  value: ReviewQueuePartitionFilter
  counts: AiReviewQueuePage["counts"] | undefined
  /** Los conteos del API son de pendientes: en Revisados solo filtran. */
  showCounts: boolean
  onChange: (value: ReviewQueuePartitionFilter) => void
}) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(next) => {
        const selected = next[0]
        if (isReviewQueuePartitionFilter(selected)) {
          onChange(selected)
        }
      }}
      variant="outline"
      size="sm"
      aria-label="Filtrar correos por partición"
      className="w-full flex-wrap justify-start"
    >
      {PARTITION_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="h-8 gap-2 rounded-full px-3"
        >
          {option.label}
          {showCounts ? (
            <Badge variant="secondary">
              {partitionCount(counts, option.value)}
            </Badge>
          ) : null}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function partitionCount(
  counts: AiReviewQueuePage["counts"] | undefined,
  partition: ReviewQueuePartitionFilter
): number {
  if (!counts) {
    return 0
  }
  return partition === "ALL" ? counts.all : counts[partition]
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
  const parts = activeFilters.map((filter) => {
    switch (filter.kind) {
      case "subject":
        return `asunto «${filter.value}»`
      case "sender":
        return `remitente ${filter.value}`
      case "dateFrom":
        return `desde el ${formatReviewDay(filter.value, locale)}`
      case "dateTo":
        return `hasta el ${formatReviewDay(filter.value, locale)}`
      case "order":
        return "más recientes primero"
      case "partition":
        return `partición ${PARTITION_LABELS[filter.value]}`
      case "status":
        return `estado ${STATUS_LABELS[filter.value]}`
      case "uncertain":
        return "solo incertidumbre (confianza < 70 % o sin predicción)"
    }
  })
  return `Filtros activos: ${parts.join(" · ")}`
}
