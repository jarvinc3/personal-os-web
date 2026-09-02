"use client"

import { FinanceBudgetsList } from "@/src/modules/finance/components/budgets/finance-budgets-list"
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"

export function FinanceBudgetsClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinanceBudgetsCatalog />
    </FinanceAuthenticatedPage>
  )
}

function FinanceBudgetsCatalog() {
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  return <FinanceBudgetsList enabled={isEnabled} display={display} />
}
