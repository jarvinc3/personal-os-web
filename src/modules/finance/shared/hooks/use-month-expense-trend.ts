"use client"

import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { useAnalyticsSummary } from "./use-analytics"
import { financeMonthSummaryRange } from "@/src/modules/finance/shared/lib/dashboard-period"
import { expenseTrend } from "@/src/modules/finance/shared/lib/finance-home-month"
import { subMonths } from "date-fns"
import { useMemo } from "react"

export function useMonthExpenseTrend(enabled: boolean) {
  const locale = useFormatLocale()
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
      ? expenseTrend({
          currentExpenses: currentQuery.data.totals.expenses,
          previousExpenses: previousQuery.data.totals.expenses,
          locale,
        })
      : null

  return { trend, currentQuery, previousQuery }
}
