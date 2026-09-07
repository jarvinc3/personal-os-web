"use client"

import { ApiError } from "@/src/config/api-client";
import { FinanceBudgetStatusChart } from "@/src/modules/finance/components/dashboard/finance-budget-status";
import { FinanceOverTimeChart } from "@/src/modules/finance/components/dashboard/finance-over-time-chart";
import { FinanceSpendingChart } from "@/src/modules/finance/components/dashboard/finance-spending-chart";
import { FinanceSummaryStats } from "@/src/modules/finance/components/dashboard/finance-summary-stats";
import {
  useAnalyticsSummary,
  useBudgetStatus,
  useSpendingByCategory,
  useSpendingOverTime,
} from "@/src/modules/finance/hooks/use-analytics";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";
import {
  FINANCE_DASHBOARD_PERIOD_OPTIONS,
  financeDashboardRange,
  type FinanceDashboardPeriod,
} from "@/src/modules/finance/lib/dashboard-period";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import { parseFinanceMoney } from "@/src/modules/finance/lib/money";
import { SelectField } from "@/src/shared/components/layout/form-blocks";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { BarChart3Icon, LandmarkIcon } from "lucide-react";
import { useMemo, useState } from "react";

function summaryErrorCopy(error: unknown): string {
  if (error instanceof ApiError && error.status === 400) {
    return `${error.message} No se inventa un tipo de cambio. Revisa las tasas FX o el periodo.`
  }
  return financeErrorMessage(error)
}

export function FinanceStatistics() {
  const { isEnabled, config } = useFinanceEnabled()
  const [period, setPeriod] = useState<FinanceDashboardPeriod>(
    config.dashboardPeriod,
  )
  const range = useMemo(
    () => financeDashboardRange(period, config.weekStartsOn),
    [period, config.weekStartsOn],
  )
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const summaryQuery = useAnalyticsSummary(isEnabled, range)
  const spendingQuery = useSpendingByCategory(isEnabled, range)
  const overTimeQuery = useSpendingOverTime(isEnabled, range)
  const budgetsQuery = useBudgetStatus(isEnabled)
  const moneyDisplay = {
    ...display,
    currency: summaryQuery.data?.baseCurrency ?? display.currency,
  }

  const buckets = Array.isArray(spendingQuery.data) ? spendingQuery.data : []
  const hasSpending = buckets.some((bucket) => {
    const total = parseFinanceMoney(bucket.total)
    return total !== null && total !== 0
  })
  const points = overTimeQuery.data?.points
  const hasSeries =
    Array.isArray(points) &&
    points.some((point) => {
      const expenses = parseFinanceMoney(point.expenses)
      const income = parseFinanceMoney(point.income)
      return (
        (expenses !== null && expenses !== 0) ||
        (income !== null && income !== 0)
      )
    })
  const budgets = Array.isArray(budgetsQuery.data)
    ? budgetsQuery.data.filter((row) => Number.isFinite(row.pctUsed))
    : []
  const chartsSettled =
    !spendingQuery.isPending &&
    !overTimeQuery.isPending &&
    !budgetsQuery.isPending
  const chartsEmpty =
    chartsSettled &&
    !spendingQuery.isError &&
    !overTimeQuery.isError &&
    !budgetsQuery.isError &&
    !hasSpending &&
    !hasSeries &&
    budgets.length === 0
  const summaryPending = summaryQuery.isPending && !summaryQuery.data

  return (
    <div className="flex flex-col gap-4">
      <SummarySection
        title="Resumen"
        icon={LandmarkIcon}
        right={
          <SelectField
            value={period}
            onChange={(value) => setPeriod(value as FinanceDashboardPeriod)}
            options={[...FINANCE_DASHBOARD_PERIOD_OPTIONS]}
          />
        }
      >
        {summaryPending ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : summaryQuery.isError ? (
          <p className="text-sm text-destructive">
            {summaryErrorCopy(summaryQuery.error)}
          </p>
        ) : summaryQuery.data ? (
          <FinanceSummaryStats
            summary={summaryQuery.data}
            display={moneyDisplay}
          />
        ) : null}
      </SummarySection>

      {chartsEmpty && summaryQuery.isSuccess ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LandmarkIcon />
            </EmptyMedia>
            <EmptyTitle>Todavía no hay movimiento</EmptyTitle>
            <EmptyDescription>
              Cuando haya transacciones confirmadas verás gasto por categoría y
              la serie en el tiempo. Los totales usan la moneda base del API.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      <SummarySection
        title="Gastos por categoría"
        icon={BarChart3Icon}
        collapsible
      >
        {spendingQuery.isError ? (
          <p className="text-sm text-destructive">
            {financeErrorMessage(spendingQuery.error)}
          </p>
        ) : hasSpending ? (
          <FinanceSpendingChart buckets={buckets} display={moneyDisplay} />
        ) : null}
      </SummarySection>

      <SummarySection
        title="Evolución en el tiempo"
        icon={BarChart3Icon}
        collapsible
      >
        {overTimeQuery.isError ? (
          <p className="text-sm text-destructive">
            {financeErrorMessage(overTimeQuery.error)}
          </p>
        ) : hasSeries ? (
          <FinanceOverTimeChart
            series={overTimeQuery.data}
            display={moneyDisplay}
          />
        ) : null}
      </SummarySection>

      <SummarySection
        title="Estado de los presupuestos"
        icon={BarChart3Icon}
        collapsible
      >
        {budgetsQuery.isError ? (
          <p className="text-sm text-destructive">
            {financeErrorMessage(budgetsQuery.error)}
          </p>
        ) : budgets.length > 0 ? (
          <FinanceBudgetStatusChart rows={budgets} display={moneyDisplay} />
        ) : null}
      </SummarySection>
    </div>
  )
}
