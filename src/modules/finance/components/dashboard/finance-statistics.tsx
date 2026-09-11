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
import { useBalanceSheet } from "@/src/modules/finance/hooks/use-balance-sheet";
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
  const balanceSheetQuery = useBalanceSheet(isEnabled)
  const spendingQuery = useSpendingByCategory(isEnabled, range)
  const overTimeQuery = useSpendingOverTime(isEnabled, range)
  const budgetsQuery = useBudgetStatus(isEnabled)
  const moneyDisplay = {
    ...display,
    currency:
      balanceSheetQuery.data?.baseCurrency ??
      summaryQuery.data?.baseCurrency ??
      display.currency,
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
  const summaryPending = balanceSheetQuery.isPending && !balanceSheetQuery.data
  const summaryError = balanceSheetQuery.error
  const summaryStats = balanceSheetQuery.data
    ? [
      {
        key: "accountBalance",
        label: "Cuentas",
        value: balanceSheetQuery.data.global.assets.accounts,
      },
      {
        key: "cardDebt",
        label: "Deuda tarjetas",
        value: balanceSheetQuery.data.global.liabilities.creditCards,
      },
      {
        key: "income",
        label: "Ingresos",
        value: summaryQuery.data?.totals.income ?? null,
      },
      {
        key: "expenses",
        label: "Gastos",
        value: summaryQuery.data?.totals.expenses ?? null,
      },
    ]
    : null

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
        ) : summaryError ? (
          <p className="text-sm text-destructive">
            {summaryErrorCopy(summaryError)}
          </p>
        ) : summaryStats ? (
          <>
            <FinanceSummaryStats
              stats={summaryStats}
              display={moneyDisplay}
            />
            {summaryQuery.isError ? (
              <p className="text-sm text-destructive">
                {summaryErrorCopy(summaryQuery.error)}
              </p>
            ) : null}
          </>
        ) : null}
      </SummarySection>

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
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BarChart3Icon />
              </EmptyMedia>
              <EmptyTitle>Todavía no hay gastos</EmptyTitle>
              <EmptyDescription>
                Cuando haya transacciones confirmadas verás gasto por categoría.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
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
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BarChart3Icon />
              </EmptyMedia>
              <EmptyTitle>Todavía no hay gastos</EmptyTitle>
              <EmptyDescription>
                Cuando haya transacciones confirmadas verás la serie en el tiempo.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
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
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BarChart3Icon />
              </EmptyMedia>
              <EmptyTitle>Todavía no hay presupuestos</EmptyTitle>
              <EmptyDescription>
                Cuando haya transacciones confirmadas verás el estado de los presupuestos.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </SummarySection>
    </div>
  )
}
