"use client"

import { FinanceExpenseTrendBadge } from "@/src/modules/finance/shared/components/expense-trend-badge"
import { MonthFlowSummary } from "@/src/modules/finance/shared/components/month-flow-summary"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useMonthExpenseTrend } from "@/src/modules/finance/shared/hooks/use-month-expense-trend"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { buttonVariants } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { formatMonthYearLabel } from "@/src/shared/lib/date-format"
import { CalendarDaysIcon, ChevronRight, Landmark } from "lucide-react"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"
import { useMemo } from "react"
import { MODULE_REGISTRY } from "@/src/shared/constants/module-registry"
import { Badge } from "@/src/shared/components/ui/badge"

export function FinanceHomeMonthSummary() {
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const now = useMemo(() => new Date(), [])
  const { trend, currentQuery } = useMonthExpenseTrend(isEnabled)

  if (!isEnabled) {
    return null
  }

  const display: FinanceMoneyDisplay = {
    currency: currentQuery.data?.baseCurrency ?? config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  return (
    <SummarySection
      icon={Landmark}
      title={MODULE_REGISTRY.finance.label}
      color={MODULE_REGISTRY.finance.accent}
      right={
        <>
          {trend ? <FinanceExpenseTrendBadge trend={trend} /> : null}
          <Link
            href={APP_ROUTES.app.finance}
            className={cn(
              buttonVariants({
                variant: "ghost",
                className: "relative h-6",
              })
            )}
          >
            <span className="sr-only">Abrir Finanzas</span>
            <ChevronRight className="size-4" />
            <LinkPendingOverlay />
          </Link>
        </>
      }
    >
      <MonthFlowSummary
        income={currentQuery.data?.totals.income}
        expenses={currentQuery.data?.totals.expenses}
        display={display}
        pending={currentQuery.isPending}
      />
      <div>
        <Badge variant="outline" className="text-xs">
          <CalendarDaysIcon className="size-4" />
          {formatMonthYearLabel(now, formatLocale)}
        </Badge>
      </div>
    </SummarySection>
  )
}
