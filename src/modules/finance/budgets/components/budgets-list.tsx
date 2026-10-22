"use client"

import { BudgetSheet } from "@/src/modules/finance/budgets/components/budget-sheet"
import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import {
  useBudget,
  useBudgets,
} from "@/src/modules/finance/shared/hooks/use-budgets"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useSheetQueryEntity } from "@/src/modules/finance/shared/hooks/use-sheet-entity"
import { budgetPctUsed } from "@/src/modules/finance/shared/lib/budget-payloads"
import { filterCategoriesByType } from "@/src/modules/finance/shared/lib/category-tree"
import {
  FINANCE_BUDGET_PAGE_SIZE,
  formatBudgetPeriodDate,
} from "@/src/modules/finance/shared/lib/budgets-query"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { joinPlanningCaption } from "@/src/modules/finance/shared/lib/planning-lists"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import {
  FINANCE_BUDGET_PERIOD_LABEL,
  type FinanceBudget,
} from "@/src/modules/finance/shared/types/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { ChartPieIcon, PlusIcon } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"

type FinanceBudgetsListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
}

function categoryLabel(budget: FinanceBudget): string {
  const list =
    budget.categories && budget.categories.length > 0
      ? budget.categories
      : budget.category
        ? [budget.category]
        : []
  if (list.length === 0) {
    return budget.name ?? "Categoría"
  }
  return list.map((category) => category.name).join(", ")
}

function budgetTone(pct: number | null, threshold: number) {
  if (pct === null) {
    return "info" as const
  }
  if (pct >= 100) {
    return "danger" as const
  }
  if (pct >= threshold) {
    return "warning" as const
  }
  return "info" as const
}

export function FinanceBudgetsList({
  enabled,
  display,
}: FinanceBudgetsListProps) {
  const {
    open: openBudgetSheet,
    sheetId: budgetSheetId,
    setOpen: setOpenBudgetSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.budget)
  const categoriesQuery = useCategories(enabled)
  const categories = filterCategoriesByType(
    categoriesQuery.data ?? [],
    "EXPENSE"
  )
  const listQuery = useBudgets(enabled, { limit: FINANCE_BUDGET_PAGE_SIZE })
  const items = infiniteListItems(listQuery.data)
  const listedEditing = budgetSheetId
    ? (items.find((budget) => budget.id === budgetSheetId) ?? null)
    : null
  const budgetQuery = useBudget(
    enabled && openBudgetSheet && Boolean(budgetSheetId) && !listedEditing,
    budgetSheetId
  )
  const editing = useSheetQueryEntity(
    openBudgetSheet,
    budgetSheetId,
    listedEditing
      ? { data: listedEditing, isPending: false, isError: false }
      : budgetQuery,
    setOpenBudgetSheet
  )

  return (
    <div className="flex flex-col gap-6">
      {listQuery.isError ? (
        <FinanceErrorState
          message={financeErrorMessage(listQuery.error)}
          onRetry={() => void listQuery.refetch()}
          isRetrying={listQuery.isFetching}
        />
      ) : null}

      <div className="flex flex-col gap-2">
        <AsyncRegion
          pending={listQuery.isPending && !listQuery.data}
          pendingFallback={<FinanceListSkeleton />}
          empty={items.length === 0}
          emptyFallback={
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ChartPieIcon />
                </EmptyMedia>
                <EmptyTitle>No hay presupuestos</EmptyTitle>
                <EmptyDescription>
                  Crea un tope por categoría y periodo para ver cuánto llevas
                  gastado.
                </EmptyDescription>
              </EmptyHeader>
              <Button onClick={() => setOpenBudgetSheet(true, null)}>
                <PlusIcon />
                Crear presupuesto
              </Button>
            </Empty>
          }
        >
          {items.map((budget) => {
            const pct = budgetPctUsed(budget.amountSpent, budget.amountLimit)
            const threshold = budget.alertThresholdPct ?? 80
            const tone = budgetTone(pct, threshold)
            const period =
              FINANCE_BUDGET_PERIOD_LABEL[budget.periodType] ??
              budget.periodType
            const range = `${formatBudgetPeriodDate(budget.periodStart, display.locale)} – ${formatBudgetPeriodDate(budget.periodEnd, display.locale)}`
            const spent = parseFinanceMoney(budget.amountSpent)
            const limit = parseFinanceMoney(budget.amountLimit)
            const remaining =
              spent !== null && limit !== null ? limit - spent : null
            const remainingLabel =
              remaining === null
                ? undefined
                : remaining < 0
                  ? `Excedido ${formatFinanceMoney(Math.abs(remaining), display)}`
                  : `Quedan ${formatFinanceMoney(remaining, display)}`
            const emoji = budget.category?.icon
            return (
              <PlanningProgressCard
                key={budget.id}
                title={categoryLabel(budget)}
                leading={
                  emoji ? (
                    <span className="text-lg leading-none">{emoji}</span>
                  ) : undefined
                }
                icon={emoji ? undefined : ChartPieIcon}
                tone={tone}
                accentColor={budget.category?.color}
                badge={{
                  label:
                    tone === "danger"
                      ? "Excedido"
                      : tone === "warning"
                        ? "Alerta"
                        : "En curso",
                  variant:
                    tone === "danger"
                      ? "danger"
                      : tone === "warning"
                        ? "warning"
                        : "info",
                }}
                progress={pct}
                currentHint="Gastado"
                currentLabel={formatFinanceMoney(budget.amountSpent, display)}
                targetHint="Tope"
                targetLabel={formatFinanceMoney(budget.amountLimit, display)}
                caption={joinPlanningCaption(remainingLabel, period, range)}
                href={APP_ROUTES.app.financeBudget(budget.id)}
              />
            )
          })}
        </AsyncRegion>
        <InfiniteListSentinel
          hasNextPage={listQuery.hasNextPage}
          isFetchingNextPage={listQuery.isFetchingNextPage}
          onLoadMore={() => void listQuery.fetchNextPage()}
        />
      </div>

      <BudgetSheet
        open={openBudgetSheet}
        onOpenChange={setOpenBudgetSheet}
        pending={Boolean(budgetSheetId) && !editing}
        budget={editing}
        categories={categories}
      />
    </div>
  )
}
