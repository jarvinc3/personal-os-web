"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { allTransactionsQueryOptions } from "@/src/modules/finance/shared/hooks/use-transactions"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { groupTransactionsByMonth } from "@/src/modules/finance/shared/lib/group-transactions-by-month"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  mergeTransactionsById,
  movementTouchesInstrument,
} from "@/src/modules/finance/shared/lib/transactions-query"
import type { FinanceTransactionType } from "@/src/modules/finance/shared/types/entities"
import { TransactionMovementRow } from "@/src/modules/finance/transactions/components/transaction-movement-row"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  LayersIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useQueries } from "@tanstack/react-query"

const SEARCH_DEBOUNCE_MS = 300

const FLOW_FILTERS = [
  { value: "ALL", label: "Todos", icon: LayersIcon },
  { value: "CREDIT", label: "Ingresos", icon: ArrowUpRightIcon },
  { value: "DEBIT", label: "Egresos", icon: ArrowDownLeftIcon },
] as const

type FlowFilter = (typeof FLOW_FILTERS)[number]["value"]

export type FinanceMovementsSource = {
  accountId?: string
  cardId?: string
}

type FinanceInstrumentMovementsProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
  sources: readonly FinanceMovementsSource[]
  emptyLabel: string
  emptyDescription: string
  onCreate: () => void
  createLabel: string
}

export function FinanceInstrumentMovements({
  enabled,
  display,
  sources,
  emptyLabel,
  emptyDescription,
  onCreate,
  createLabel,
}: FinanceInstrumentMovementsProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [flow, setFlow] = useState<FlowFilter>("ALL")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  const filters = useMemo(
    () => ({
      type: flow === "ALL" ? undefined : (flow as FinanceTransactionType),
      search: debouncedSearch || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [flow, debouncedSearch, dateFrom, dateTo]
  )

  const movementQueries = useQueries({
    queries: sources.map((source) => ({
      ...allTransactionsQueryOptions({
        ...filters,
        accountId: source.accountId,
        cardId: source.cardId,
      }),
      enabled: enabled && sources.length > 0,
    })),
  })
  const movements = useMemo(
    () =>
      mergeTransactionsById(movementQueries.map((query) => query.data ?? [])),
    [movementQueries]
  )
  const categoriesQuery = useCategories(enabled)
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data]
  )
  const groups = useMemo(() => groupTransactionsByMonth(movements), [movements])
  const filtersActive = flow !== "ALL" || Boolean(dateFrom || dateTo)
  const queryNarrowed = Boolean(search.trim()) || filtersActive
  const isPending = movementQueries.some((query) => query.isPending)
  const error = movementQueries.find((query) => query.error)?.error ?? null
  const loadErrorMessage = error ? financeLoadErrorMessage(error) : null
  const isRetrying = movementQueries.some((query) => query.isFetching)
  const retryMovements = () => {
    for (const query of movementQueries) {
      void query.refetch()
    }
  }

  const showToolbar = queryNarrowed || movements.length > 0

  return (
    <div className="flex flex-col gap-4">
      {showToolbar ? (
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar movimiento o comerciante"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoComplete="off"
              className="pr-3 pl-8"
            />
          </div>
          <Button
            type="button"
            variant={filtersActive ? "default" : "outline"}
            className={cn("h-10 shrink-0 rounded-full px-3", PRESSABLE_CLASS)}
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontalIcon />
            Filtros
          </Button>
        </div>
      ) : null}

      {loadErrorMessage ? (
        <FinanceErrorState
          message={loadErrorMessage}
          onRetry={retryMovements}
          isRetrying={isRetrying}
        />
      ) : null}

      <AsyncRegion
        pending={isPending}
        pendingFallback={<FinanceListSkeleton rows={4} />}
        empty={!loadErrorMessage && movements.length === 0}
        emptyFallback={
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ArrowLeftRightIcon />
              </EmptyMedia>
              <EmptyTitle>
                {queryNarrowed ? "Ningún movimiento coincide" : emptyLabel}
              </EmptyTitle>
              <EmptyDescription>
                {queryNarrowed
                  ? "Prueba con otro tipo, otra fecha o borra la búsqueda."
                  : emptyDescription}
              </EmptyDescription>
            </EmptyHeader>
            {queryNarrowed ? null : (
              <EmptyContent>
                <Button onClick={onCreate}>
                  <PlusIcon />
                  {createLabel}
                </Button>
              </EmptyContent>
            )}
          </Empty>
        }
      >
        {groups.map((group) => (
          <section key={group.key} className="flex flex-col gap-2">
            <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {group.label}
            </p>
            <div className="overflow-hidden rounded-2xl border border-border">
              {group.items.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    index !== group.items.length - 1 &&
                      "border-b border-border/60"
                  )}
                >
                  <TransactionMovementRow
                    transaction={transaction}
                    categories={categories}
                    display={display}
                    instrument={sources.find((source) =>
                      movementTouchesInstrument(transaction, source)
                    )}
                    href={APP_ROUTES.app.financeTransaction(transaction.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </AsyncRegion>

      <BottomSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Filtros"
        description="Tipo de movimiento y rango de fechas"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {FLOW_FILTERS.map((option) => {
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={flow === option.value ? "default" : "outline"}
                  className={cn("rounded-full", PRESSABLE_CLASS)}
                  onClick={() => setFlow(option.value)}
                >
                  <Icon className="size-4 shrink-0" />
                  {option.label}
                </Button>
              )
            })}
          </div>
          <FinanceDateField
            label="Desde"
            value={dateFrom}
            onChange={setDateFrom}
            optional
          />
          <FinanceDateField
            label="Hasta"
            value={dateTo}
            onChange={setDateTo}
            optional
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFlow("ALL")
                setDateFrom("")
                setDateTo("")
              }}
            >
              <XIcon className="size-4 shrink-0" />
              Limpiar
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => setFiltersOpen(false)}
            >
              <CheckIcon className="size-4 shrink-0" />
              Aplicar
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
