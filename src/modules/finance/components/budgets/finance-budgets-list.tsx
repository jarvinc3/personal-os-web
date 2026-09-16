"use client"

import { BudgetSheet } from "@/src/modules/finance/components/budgets/budget-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import { useBudget, useBudgets } from "@/src/modules/finance/hooks/use-budgets"
import { useCategories } from "@/src/modules/finance/hooks/use-categories"
import { useSheetQueryEntity } from "@/src/modules/finance/hooks/use-sheet-entity"
import { budgetPctUsed } from "@/src/modules/finance/lib/budget-payloads"
import { filterCategoriesByType } from "@/src/modules/finance/lib/category-tree"
import {
  budgetsFromPayload,
  FINANCE_BUDGET_PAGE_SIZE,
  formatBudgetPeriodDate,
} from "@/src/modules/finance/lib/budgets-query"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/lib/money"
import {
  FINANCE_BUDGET_PERIOD_LABEL,
  type FinanceBudget,
} from "@/src/modules/finance/types/entities"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Separator } from "@/src/shared/components/ui/separator"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PiggyBankIcon,
  PlusIcon,
} from "lucide-react"
import { useState } from "react"

type FinanceBudgetsListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
}

function categoryLabel(budget: FinanceBudget): string {
  const name = budget.category?.name ?? "Categoría"
  return `${budget.category?.icon ? `${budget.category.icon} ` : ""}${name}`
}

function BudgetUsageBar({
  pct,
  color,
}: {
  pct: number
  color?: string | null
}) {
  const width = Math.min(100, Math.max(0, pct))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${width}%`, backgroundColor: color ?? undefined }}
      />
    </div>
  )
}

export function FinanceBudgetsList({
  enabled,
  display,
}: FinanceBudgetsListProps) {
  const [page, setPage] = useState(1)
  const {
    open: openBudgetSheet,
    sheetId: budgetSheetId,
    setOpen: setOpenBudgetSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.budget)
  const categoriesQuery = useCategories(enabled)
  const categories = filterCategoriesByType(
    categoriesQuery.data ?? [],
    "EXPENSE",
  )
  const listQuery = useBudgets(enabled, {
    page,
    limit: FINANCE_BUDGET_PAGE_SIZE,
  })
  const listed = budgetsFromPayload(listQuery.data)
  const { items, pagination } = listed
  const hasCategories = categories.length > 0
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
        <p className="text-sm text-destructive">
          {financeErrorMessage(listQuery.error)}
        </p>
      ) : null}

      <SummarySection
        title="Presupuestos"
        icon={PiggyBankIcon}
        right={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!enabled || !hasCategories}
            onClick={() => setOpenBudgetSheet(true, null)}
          >
            <PlusIcon />
            Crear presupuesto
          </Button>
        }
      >
        {listQuery.isPending && !listQuery.data ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PiggyBankIcon />
              </EmptyMedia>
              <EmptyTitle>No hay presupuestos</EmptyTitle>
              <EmptyDescription>
                Crea un tope por categoría y periodo para ver cuánto llevas
                gastado.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          items.map((budget, index) => {
            const pct = budgetPctUsed(budget.amountSpent, budget.amountLimit)
            const period =
              FINANCE_BUDGET_PERIOD_LABEL[budget.periodType] ??
              budget.periodType
            const range = `${formatBudgetPeriodDate(budget.periodStart)} – ${formatBudgetPeriodDate(budget.periodEnd)}`
            const spent = formatFinanceMoney(budget.amountSpent, display)
            const limit = formatFinanceMoney(budget.amountLimit, display)
            const pctLabel = pct === null ? "—" : `${pct.toFixed(0)}%`
            return (
              <div key={budget.id} className="flex flex-col gap-2">
                <SummaryItem
                  title={categoryLabel(budget)}
                  description={`${period} · ${range}`}
                  value={`${spent} / ${limit} · ${pctLabel}`}
                  onPress={() => setOpenBudgetSheet(true, budget.id)}
                  isLast={index === items.length - 1}
                />
                {pct !== null ? (
                  <BudgetUsageBar pct={pct} color={budget.category?.color} />
                ) : null}
              </div>
            )
          })
        )}

        <Separator />

        {listQuery.isSuccess ? (
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || listQuery.isPending}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeftIcon />
              Anterior
            </Button>
            <p className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || listQuery.isPending}
              onClick={() => setPage((current) => current + 1)}
            >
              Siguiente
              <ChevronRightIcon />
            </Button>
          </div>
        ) : null}
      </SummarySection>

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
