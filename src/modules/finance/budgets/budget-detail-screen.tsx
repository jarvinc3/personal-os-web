"use client"

import { BudgetSheet } from "@/src/modules/finance/budgets/components/budget-sheet"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import type { PlanningProgressTone } from "@/src/modules/finance/planning"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useBudget } from "@/src/modules/finance/shared/hooks/use-budgets"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useTransactions } from "@/src/modules/finance/shared/hooks/use-transactions"
import { budgetPctUsed } from "@/src/modules/finance/shared/lib/budget-payloads"
import { formatBudgetPeriodDate } from "@/src/modules/finance/shared/lib/budgets-query"
import { filterCategoriesByType } from "@/src/modules/finance/shared/lib/category-tree"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  formatCalendarDate,
  sliceDateInput,
} from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import { joinPlanningCaption } from "@/src/modules/finance/shared/lib/planning-lists"
import { FINANCE_TIMELINE_PAGE_SIZE } from "@/src/modules/finance/shared/lib/transactions-query"
import {
  FINANCE_BUDGET_PERIOD_LABEL,
  FINANCE_TRANSACTION_STATUS_LABEL,
  type FinanceTransactionStatus,
} from "@/src/modules/finance/shared/types/entities"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
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
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { ACCENT_FALLBACK_COLOR } from "@/src/shared/lib/accent-gradient"
import { ArrowLeftIcon, ChartPieIcon, MoreVerticalIcon } from "lucide-react"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

const CONFIRMED_STATUS: FinanceTransactionStatus = "CONFIRMED"

function budgetTone(
  pct: number | null,
  threshold: number
): PlanningProgressTone {
  if (pct === null) {
    return "info"
  }
  if (pct >= 100) {
    return "danger"
  }
  if (pct >= threshold) {
    return "warning"
  }
  return "info"
}

function budgetBadge(tone: PlanningProgressTone): {
  label: string
  variant: "danger" | "warning" | "info"
} {
  if (tone === "danger") {
    return { label: "Excedido", variant: "danger" }
  }
  if (tone === "warning") {
    return { label: "Alerta", variant: "warning" }
  }
  return { label: "En curso", variant: "info" }
}

/** Only a status other than confirmed is worth a caption on a movement. */
function movementStatusCaption(
  status: FinanceTransactionStatus
): string | undefined {
  if (status === CONFIRMED_STATUS) {
    return undefined
  }
  return FINANCE_TRANSACTION_STATUS_LABEL[status]
}

type FinanceBudgetDetailProps = {
  budgetId: string
}

export function BudgetDetailScreen({ budgetId }: FinanceBudgetDetailProps) {
  return (
    <FinanceGate>
      <BudgetDetailScreenBody budgetId={budgetId} />
    </FinanceGate>
  )
}

function BudgetDetailScreenBody({ budgetId }: FinanceBudgetDetailProps) {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const budgetQuery = useBudget(isEnabled, budgetId)
  const categoriesQuery = useCategories(isEnabled)
  const budget = budgetQuery.data ?? null
  const categories = filterCategoriesByType(
    categoriesQuery.data ?? [],
    "EXPENSE"
  )
  const { open: openBudgetSheet, setOpen: setOpenBudgetSheet } = useSheetParam(
    FINANCE_SHEET_KEYS.budget
  )

  const movementsQuery = useTransactions(Boolean(budget), {
    limit: FINANCE_TIMELINE_PAGE_SIZE,
    type: "DEBIT",
    ...(budget
      ? {
          categoryId: budget.categoryId,
          dateFrom: sliceDateInput(budget.periodStart),
          dateTo: sliceDateInput(budget.periodEnd),
        }
      : {}),
  })

  const movements = movementsQuery.data?.items ?? []
  const accent = budget?.category?.color ?? ACCENT_FALLBACK_COLOR
  const pct = budget
    ? budgetPctUsed(budget.amountSpent, budget.amountLimit)
    : null
  const progress = Math.min(100, Math.max(0, pct ?? 0))
  const remaining = budget
    ? (parseFinanceMoney(budget.amountLimit) ?? 0) -
      (parseFinanceMoney(budget.amountSpent) ?? 0)
    : 0
  const tone = budget ? budgetTone(pct, budget.alertThresholdPct ?? 80) : "info"
  const badge = budgetBadge(tone)

  const headerActions = useMemo(
    () => (
      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        aria-label="Opciones del presupuesto"
        onClick={() => setOpenBudgetSheet(true)}
      >
        <MoreVerticalIcon className="size-4.5" />
      </Button>
    ),
    [setOpenBudgetSheet]
  )

  usePageHeader(
    {
      variant: "secondary",
      title: budget?.category?.name ?? "Presupuesto",
      onBack: () => router.back(),
      actions: headerActions,
      accentColor: accent,
    },
    [router, budget?.category?.name, accent, headerActions]
  )

  if (budgetQuery.isPending && !budget) {
    return <LoadingView />
  }

  if (!budget) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartPieIcon />
          </EmptyMedia>
          <EmptyTitle>No encontramos este presupuesto</EmptyTitle>
          <EmptyDescription>
            Puede que se haya borrado o que su periodo ya haya terminado.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" asChild>
            <Link href={APP_ROUTES.app.financePlanning} className="relative">
              <ArrowLeftIcon className="size-4 shrink-0" />
              Volver a Planificación
              <LinkPendingOverlay />
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const periodLabel =
    FINANCE_BUDGET_PERIOD_LABEL[budget.periodType] ?? budget.periodType
  const periodRange = `${formatBudgetPeriodDate(budget.periodStart)} – ${formatBudgetPeriodDate(budget.periodEnd)}`
  const emoji = budget.category?.icon

  return (
    <>
      {budgetQuery.error ? (
        <div className="mb-3">
          <FinanceErrorState
            message={financeLoadErrorMessage(budgetQuery.error)}
            onRetry={() => void budgetQuery.refetch()}
            isRetrying={budgetQuery.isFetching}
          />
        </div>
      ) : null}

      <div className="-mx-4 -mt-4 overflow-hidden md:-mx-6">
        <div
          className="rounded-b-3xl p-4 text-white md:p-6"
          style={{ background: accent }}
        >
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg">
              {emoji ?? <ChartPieIcon className="size-6" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {budget.category?.name ?? "Sin categoría"}
                </h1>
                <Badge variant={badge.variant} className="shrink-0">
                  {badge.label}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-white/70">
                {joinPlanningCaption(periodLabel, periodRange)}
              </p>
            </div>
          </div>

          <p className="mt-8 text-[11px] tracking-wide text-white/60 uppercase">
            Gastado
          </p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {formatFinanceMoney(budget.amountSpent, display)}
          </p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-x-3 text-xs text-white/70">
            <span>{Math.round(progress)}% del tope</span>
            <span>Tope {formatFinanceMoney(budget.amountLimit, display)}</span>
          </div>
          <p className="mt-3 text-sm text-white/80">
            {remaining < 0
              ? `Excedido en ${formatFinanceMoney(Math.abs(remaining), display)}`
              : `Quedan ${formatFinanceMoney(remaining, display)}`}
            {` · alerta al ${budget.alertThresholdPct}%`}
          </p>
        </div>
      </div>

      <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
        <h2 className="text-sm font-medium text-muted-foreground">
          Movimientos del periodo
        </h2>

        {movementsQuery.isError ? (
          <FinanceErrorState
            message={financeLoadErrorMessage(movementsQuery.error)}
            onRetry={() => void movementsQuery.refetch()}
            isRetrying={movementsQuery.isFetching}
          />
        ) : null}

        {movementsQuery.isPending ? <FinanceListSkeleton rows={4} /> : null}

        {!movementsQuery.isPending && movements.length === 0 ? (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ChartPieIcon />
              </EmptyMedia>
              <EmptyTitle>Sin gastos en este periodo</EmptyTitle>
              <EmptyDescription>
                Un gasto aparece aquí cuando tiene esta categoría y cae dentro
                de las fechas del presupuesto.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {movements.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card">
            {movements.map((movement, index) => (
              <SummaryItem
                key={movement.id}
                title={
                  movement.merchant ?? movement.description ?? "Movimiento"
                }
                description={joinPlanningCaption(
                  formatCalendarDate(movement.transactionDate),
                  movementStatusCaption(movement.status)
                )}
                value={formatFinanceMoney(movement.amount, {
                  ...display,
                  currency: movement.currency,
                })}
                isLast={index === movements.length - 1}
              />
            ))}
          </div>
        ) : null}

        {movementsQuery.data?.hasMore ? (
          <p className="px-1 text-xs text-muted-foreground">
            Mostrando los primeros {movements.length} movimientos del periodo.
          </p>
        ) : null}
      </div>

      <BudgetSheet
        open={openBudgetSheet}
        onOpenChange={setOpenBudgetSheet}
        budget={budget}
        categories={categories}
        pending={budgetQuery.isFetching}
      />
    </>
  )
}
