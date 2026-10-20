"use client"

import { useAnalyticsSummary } from "./use-analytics"
import { financeMonthSummaryRange } from "@/src/modules/finance/shared/lib/dashboard-period"
import { expenseTrend } from "@/src/modules/finance/shared/lib/finance-home-month"
import { subMonths } from "date-fns"
import { useMemo } from "react"

export function useMonthExpenseTrend(enabled: boolean) {
  const now = useMemo(() => new Date(), [])
  const currentRange = useMemo(() => financeMonthSummaryRange(now), [now])
  const previousRange = useMemo(
    () => financeMonthSummaryRange(subMonths(now, 1)),
    [now]
  )
  const currentQuery = useAnalyticsSummary(enabled, currentRange)
  const previousQuery = useAnalyticsSummary(enabled, previousRange)
  const trend =
    currentQuery.data && previousQuery.data
      ? expenseTrend(
          currentQuery.data.totals.expenses,
          previousQuery.data.totals.expenses
        )
      : null

  return { trend, currentQuery, previousQuery }
}
