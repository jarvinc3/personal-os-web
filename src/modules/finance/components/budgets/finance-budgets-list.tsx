"use client"

import { BudgetSheet } from "@/src/modules/finance/components/budgets/budget-sheet"
import { PlanningProgressCard } from "@/src/modules/finance/components/planning/planning-progress-card"
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
import { joinPlanningCaption } from "@/src/modules/finance/lib/planning-lists"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import { formatFinanceMoney, parseFinanceMoney } from "@/src/modules/finance/lib/money"
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
import { FinanceListSkeleton } from "@/src/modules/finance/components/layout/finance-list-skeleton"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import {
  ChartPieIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react"
import { useState } from "react"

type FinanceBudgetsListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
}

function categoryLabel(budget: FinanceBudget): string {
  return budget.category?.name ?? "Categoría"
}

function budgetTone(pct: number | null, threshold: number) {
  if (pct === null) return "info" as const
  if (pct >= 100) return "danger" as const
  if (pct >= threshold) return "warning" as const
  return "info" as const
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
        icon={ChartPieIcon}
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
          <FinanceListSkeleton />
        ) : items.length === 0 ? (
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
          </Empty>
        ) : (
          items.map((budget) => {
            const pct = budgetPctUsed(budget.amountSpent, budget.amountLimit)
            const threshold = budget.alertThresholdPct ?? 80
            const tone = budgetTone(pct, threshold)
            const period =
              FINANCE_BUDGET_PERIOD_LABEL[budget.periodType] ??
              budget.periodType
            const range = `${formatBudgetPeriodDate(budget.periodStart)} – ${formatBudgetPeriodDate(budget.periodEnd)}`
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
                onPress={() => setOpenBudgetSheet(true, budget.id)}
              />
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
