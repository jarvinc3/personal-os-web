"use client"

import { FinanceDateField } from "@/src/modules/finance/components/forms/finance-date-field"
import { FinanceListSkeleton } from "@/src/modules/finance/components/layout/finance-list-skeleton"
import { FinanceErrorState } from "@/src/modules/finance/components/layout/finance-error-state"
import { TransactionDetailSheet } from "@/src/modules/finance/components/transactions/transaction-detail-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import { useCategories } from "@/src/modules/finance/hooks/use-categories"
import { allTransactionsQueryOptions } from "@/src/modules/finance/hooks/use-transactions"
import { financeLoadErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { groupTransactionsByMonth } from "@/src/modules/finance/lib/group-transactions-by-month"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import {
  formatTransactionDate,
  isTransferTransaction,
  mergeTransactionsById,
  movementSign,
  signedAmount,
} from "@/src/modules/finance/lib/transactions-query"
import type {
  FinanceCategory,
  FinanceTransaction,
  FinanceTransactionType,
} from "@/src/modules/finance/types/entities"
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
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  PlusIcon,
  ScaleIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useQueries } from "@tanstack/react-query"

const SEARCH_DEBOUNCE_MS = 300

const FLOW_FILTERS = [
  { value: "ALL", label: "Todos" },
  { value: "CREDIT", label: "Ingresos" },
  { value: "DEBIT", label: "Egresos" },
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

function transactionRowTitle(
  transaction: FinanceTransaction,
  category: FinanceCategory | undefined
): string {
  return (
    category?.name?.trim() ||
    transaction.merchant ||
    transaction.description ||
    "Movimiento"
  )
}

function transactionRowDetail(
  transaction: FinanceTransaction,
  category: FinanceCategory | undefined
): string {
  const date = formatTransactionDate(transaction.transactionDate)
  if (!transaction.merchant || !category) {
    return date
  }
  return `${transaction.merchant} · ${date}`
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
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [flow, setFlow] = useState<FlowFilter>("ALL")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const {
    open: openDetailSheet,
    sheetId: detailSheetId,
    setOpen: setOpenDetailSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.transactionDetail)

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
  const categoryById = useMemo(
    () =>
      new Map(categories.map((category) => [category.id, category] as const)),
    [categories]
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

      {isPending ? <FinanceListSkeleton rows={4} /> : null}

      {!isPending && !loadErrorMessage && movements.length === 0 ? (
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ArrowLeftRightIcon />
            </EmptyMedia>
            <EmptyTitle>
              {queryNarrowed
                ? "Ningún movimiento coincide"
                : emptyLabel}
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
      ) : null}

      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {group.label}
          </p>
          <div className="rounded-2xl border border-border bg-card">
            {group.items.map((transaction, index) => {
              const isTransfer = isTransferTransaction(transaction)
              const category = transaction.categoryId
                ? categoryById.get(transaction.categoryId)
                : undefined
              const parent = category?.parentId
                ? categoryById.get(category.parentId)
                : undefined
              const icon = isTransfer
                ? undefined
                : category?.icon?.trim() || parent?.icon?.trim()
              const color = isTransfer
                ? "#3B82F6"
                : category?.color?.trim() || parent?.color?.trim() || "#64748B"
              return (
                <SummaryItem
                  key={transaction.id}
                  title={transactionRowTitle(transaction, category)}
                  description={transactionRowDetail(transaction, category)}
                  leading={
                    icon ? (
                      <span>{icon}</span>
                    ) : isTransfer ? (
                      <ArrowLeftRightIcon className="size-5 text-info" />
                    ) : transaction.type === "DEBIT" ? (
                      <ArrowDownLeftIcon className="size-5 text-destructive" />
                    ) : transaction.type === "CREDIT" ? (
                      <ArrowUpRightIcon className="size-5 text-success" />
                    ) : transaction.type === "ADJUSTMENT" ? (
                      <ScaleIcon
                        className={cn(
                          "size-5",
                          movementSign(transaction) === "−"
                            ? "text-destructive"
                            : "text-success"
                        )}
                      />
                    ) : null
                  }
                  accentColor={color}
                  value={
                    <span
                      className={cn(
                        !isTransfer &&
                          movementSign(transaction) === "−" &&
                          "text-destructive",
                        !isTransfer &&
                          movementSign(transaction) === "+" &&
                          "text-success"
                      )}
                    >
                      {signedAmount(transaction, display)}
                    </span>
                  }
                  showChevron={false}
                  onPress={() => setOpenDetailSheet(true, transaction.id)}
                  isLast={index === group.items.length - 1}
                />
              )
            })}
          </div>
        </section>
      ))}

      <BottomSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Filtros"
        description="Tipo de movimiento y rango de fechas"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {FLOW_FILTERS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={flow === option.value ? "default" : "outline"}
                className={cn("rounded-full", PRESSABLE_CLASS)}
                onClick={() => setFlow(option.value)}
              >
                {option.label}
              </Button>
            ))}
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
              Limpiar
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => setFiltersOpen(false)}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </BottomSheet>

      <TransactionDetailSheet
        open={openDetailSheet}
        onOpenChange={setOpenDetailSheet}
        transactionId={detailSheetId}
        enabled={enabled}
        display={display}
        onEdit={(transaction) => {
          router.push(APP_ROUTES.app.financeTransactionEdit(transaction.id))
        }}
      />
    </div>
  )
}
