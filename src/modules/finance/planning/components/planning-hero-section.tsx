"use client"

import { FinancePlanningHero } from "@/src/modules/finance/planning/components/planning-hero"
import {
  nextPlanningTab,
  planningTabItem,
  planningTabLabel,
  type PlanningTab,
} from "@/src/modules/finance/planning/lib/planning-tabs"
import { formatPlanningTabTotal } from "@/src/modules/finance/planning/lib/planning-totals"
import { useBudgetStatus } from "@/src/modules/finance/shared/hooks/use-analytics"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useLoans } from "@/src/modules/finance/shared/hooks/use-loans"
import { useReceivables } from "@/src/modules/finance/shared/hooks/use-receivables"
import { useSavingsGoals } from "@/src/modules/finance/shared/hooks/use-savings-goals"
import {
  APP_ROUTES,
  financeTransactionNewHref,
} from "@/src/shared/constants/app-routes"
import { useState } from "react"

const PENDING_TOTAL = "…"
const UNAVAILABLE_TOTAL = "—"

type FinancePlanningHeroSectionProps = {
  activeTab: PlanningTab
}

export function FinancePlanningHeroSection({
  activeTab,
}: FinancePlanningHeroSectionProps) {
  const { isEnabled, config } = useFinanceEnabled()
  const [displayedTab, setDisplayedTab] = useState<PlanningTab>(activeTab)

  const savingsQuery = useSavingsGoals(isEnabled)
  const budgetStatusQuery = useBudgetStatus(isEnabled)
  const receivablesQuery = useReceivables(isEnabled)
  const loansQuery = useLoans(isEnabled)

  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }
  const tabItem = planningTabItem(displayedTab)
  const totalSource = {
    savings: savingsQuery,
    budgets: budgetStatusQuery,
    receivables: receivablesQuery,
    loans: loansQuery,
  }[displayedTab]
  const totalAmount =
    totalSource.isPending && !totalSource.data
      ? PENDING_TOTAL
      : totalSource.isError && !totalSource.data
        ? UNAVAILABLE_TOTAL
        : formatPlanningTabTotal({
            tab: displayedTab,
            input: {
              savings: savingsQuery.data ?? [],
              budgets: budgetStatusQuery.data ?? [],
              receivables: receivablesQuery.data ?? [],
              loans: loansQuery.data ?? [],
            },
            display,
          })

  return (
    <FinancePlanningHero
      tabLabel={planningTabLabel(displayedTab)}
      tabIcon={tabItem.icon}
      tabColor={tabItem.color}
      totalAmount={totalAmount}
      sendHref={financeTransactionNewHref("DEBIT")}
      receiveHref={financeTransactionNewHref("CREDIT")}
      transferHref={APP_ROUTES.app.financeTransferNew}
      onCyclePress={() =>
        setDisplayedTab((current) => nextPlanningTab(current))
      }
    />
  )
}
