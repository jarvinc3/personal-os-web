"use client"

import { useAnalyticsSummary } from "@/src/modules/finance/hooks/use-analytics"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import { financeDashboardRange } from "@/src/modules/finance/lib/dashboard-period"
import { expenseTrend } from "@/src/modules/finance/lib/finance-home-month"
import { subMonths } from "date-fns"
import { useMemo } from "react"

export function useMonthExpenseTrend(enabled: boolean) {
  const { config } = useFinanceEnabled()
  const now = useMemo(() => new Date(), [])
  const currentRange = useMemo(
    () => financeDashboardRange("month", config.weekStartsOn, now),
    [config.weekStartsOn, now],
  )
  const previousRange = useMemo(
    () =>
      financeDashboardRange("month", config.weekStartsOn, subMonths(now, 1)),
    [config.weekStartsOn, now],
  )
  const currentQuery = useAnalyticsSummary(enabled, currentRange)
  const previousQuery = useAnalyticsSummary(enabled, previousRange)
  const trend =
    currentQuery.data && previousQuery.data
      ? expenseTrend(
          currentQuery.data.totals.expenses,
          previousQuery.data.totals.expenses,
        )
      : null

  return { trend, currentQuery, previousQuery }
}
