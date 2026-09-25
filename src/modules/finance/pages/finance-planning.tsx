"use client"

import { FinanceHomeHeroSection } from "@/src/modules/finance/components/dashboard/finance-home-hero-section";
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
    <div className="flex flex-col gap-8">
      <FinanceHomeHeroSection />
      <FinancePlanningList
        enabled={isEnabled}
        display={display}
        defaultCurrency={config.baseCurrency}
      />
    </div>
  )
}
