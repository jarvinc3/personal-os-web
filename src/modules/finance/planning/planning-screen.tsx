"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinancePlanningHeroSection } from "@/src/modules/finance/planning/components/planning-hero-section"
import { FinancePlanningList } from "@/src/modules/finance/planning/components/planning-list"
import {
  DEFAULT_PLANNING_TAB,
  SHARE_PLANNING_TAB,
  type PlanningTab,
} from "@/src/modules/finance/planning/lib/planning-tabs"
import { readShareMode } from "@/src/modules/finance/planning/lib/receivable-share-mode"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

export function PlanningScreen() {
  return (
    <FinanceGate>
      <PlanningScreenBody />
    </FinanceGate>
  )
}

function PlanningScreenBody() {
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<PlanningTab>(() =>
    readShareMode(searchParams).active
      ? SHARE_PLANNING_TAB
      : DEFAULT_PLANNING_TAB
  )
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  return (
    <div className="flex flex-col gap-8">
      <FinancePlanningHeroSection key={tab} activeTab={tab} />
      <FinancePlanningList
        tab={tab}
        onTabChange={setTab}
        enabled={isEnabled}
        display={display}
        defaultCurrency={config.baseCurrency}
      />
    </div>
  )
}
