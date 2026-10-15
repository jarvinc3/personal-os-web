"use client"

import { FinanceExpenseTrendBadge } from "@/src/modules/finance/shared/components/expense-trend-badge"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useMonthExpenseTrend } from "@/src/modules/finance/shared/hooks/use-month-expense-trend"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type { FinanceAnalyticsSummary } from "@/src/modules/finance/shared/types/entities"
import { Button } from "@/src/shared/components/ui/button"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { formatMonthYearLabel } from "@/src/shared/lib/date-format"
import {
  BanknoteArrowDownIcon,
  BanknoteArrowUpIcon,
  CalendarDaysIcon,
  ChevronRight,
  Landmark,
} from "lucide-react"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import Link from "next/link"
import { useMemo } from "react"
import { MODULE_REGISTRY } from "@/src/shared/constants/module-registry"
import { Badge } from "@/src/shared/components/ui/badge"

type AnalyticsSummaryQuery = {
  isPending: boolean
  data?: FinanceAnalyticsSummary
}

function formatSummaryAmount(
  query: AnalyticsSummaryQuery,
  selectAmount: (summary: FinanceAnalyticsSummary) => string,
  display: FinanceMoneyDisplay
): string {
  if (query.isPending) {
    return "…"
  }
  if (!query.data) {
    return "—"
  }
  return formatFinanceMoney(selectAmount(query.data), display)
}

export function FinanceHomeMonthSummary() {
  const { isEnabled, config } = useFinanceEnabled()
  const now = useMemo(() => new Date(), [])
  const { trend, currentQuery } = useMonthExpenseTrend(isEnabled)

  if (!isEnabled) {
    return null
  }

  const display: FinanceMoneyDisplay = {
    currency: currentQuery.data?.baseCurrency ?? config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }
  const incomeValue = formatSummaryAmount(
    currentQuery,
    (summary) => summary.totals.income,
    display
  )
  const expenseValue = formatSummaryAmount(
    currentQuery,
    (summary) => summary.totals.expenses,
    display
  )

  return (
    <SummarySection
      icon={Landmark}
      title={MODULE_REGISTRY.finance.label}
      color={MODULE_REGISTRY.finance.accent}
      right={
        <>
          {trend ? <FinanceExpenseTrendBadge trend={trend} /> : null}
          <Button asChild variant="ghost" className="h-6">
            <Link href={APP_ROUTES.app.finance} className="relative">
              <span className="sr-only">Abrir Finanzas</span>
              <ChevronRight className="size-4" />
              <LinkPendingOverlay />
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <div
          aria-label="Ingresos del mes"
          className="relative flex items-center justify-start rounded-2xl bg-card/50 px-3 py-2"
        >
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Ingresos</p>
            <p className="text-sm font-semibold text-success tabular-nums">
              + {incomeValue}
            </p>
          </div>
          <BanknoteArrowUpIcon className="absolute top-1/2 right-2 size-4 -translate-y-1/2 text-success" />
        </div>

        <div
          aria-label="Gastos del mes"
          className="relative flex items-center justify-end rounded-2xl bg-card/50 px-3 py-2 text-right"
        >
          <BanknoteArrowDownIcon className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-destructive" />
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Gastos</p>
            <p className="text-sm font-semibold text-destructive tabular-nums">
              − {expenseValue}
            </p>
          </div>
        </div>
      </div>
      <div>
        <Badge variant="outline" className="text-xs">
          <CalendarDaysIcon className="size-4" />
          {formatMonthYearLabel(now)}
        </Badge>
      </div>
    </SummarySection>
  )
}
