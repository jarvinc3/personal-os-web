"use client"

import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page";
import { FinancePlanningList } from "@/src/modules/finance/components/planning/finance-planning";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";

export function FinancePlanningClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinancePlanningCatalog />
    </FinanceAuthenticatedPage>
  )
}

function FinancePlanningCatalog() {
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  return (
    <FinancePlanningList
      enabled={isEnabled}
      display={display}
      defaultCurrency={config.baseCurrency}
    />
  )
}
