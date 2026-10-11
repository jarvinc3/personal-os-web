"use client"

import { FinanceHomeHeroSection } from "@/src/modules/finance/dashboard"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinancePlanningList } from "@/src/modules/finance/planning/components/planning-list"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"

export function PlanningScreen() {
  return (
    <FinanceGate>
      <PlanningScreenBody />
    </FinanceGate>
  )
}

function PlanningScreenBody() {
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
