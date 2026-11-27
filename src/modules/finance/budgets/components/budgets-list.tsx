"use client"

import { BudgetCard } from "@/src/modules/finance/budgets/components/budget-card"
import { BudgetSheet } from "@/src/modules/finance/budgets/components/budget-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import {
  useBudget,
  useBudgets,
} from "@/src/modules/finance/shared/hooks/use-budgets"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useSheetQueryEntity } from "@/src/modules/finance/shared/hooks/use-sheet-entity"
import { filterCategoriesByType } from "@/src/modules/finance/shared/lib/category-tree"
import { FINANCE_BUDGET_PAGE_SIZE } from "@/src/modules/finance/shared/lib/budgets-query"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { ChartPieIcon, PlusIcon } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"

type FinanceBudgetsListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
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
        <ErrorState
          message={financeErrorMessage(listQuery.error)}
          onRetry={() => void listQuery.refetch()}
          isRetrying={listQuery.isFetching}
        />
      ) : null}

      <div className="flex flex-col gap-2">
        <AsyncRegion
          pending={listQuery.isPending && !listQuery.data}
          pendingFallback={
            <div className="flex flex-col gap-2 px-3 py-2" aria-hidden>
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          }
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
          {items.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              display={display}
              href={APP_ROUTES.app.financeBudget(budget.id)}
            />
          ))}
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
