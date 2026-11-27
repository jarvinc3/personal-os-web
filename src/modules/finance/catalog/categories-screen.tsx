"use client"

import { FinanceCategoriesSection } from "@/src/modules/finance/catalog/components/categories-section"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useBackTo } from "@/src/shared/hooks/use-back-to"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

export function CategoriesScreen() {
  return (
    <FinanceGate>
      <CategoriesScreenBody />
    </FinanceGate>
  )
}

function CategoriesScreenBody() {
  const { isEnabled } = useFinanceEnabled()

  const handleBack = useBackTo(APP_ROUTES.app.financeProducts)

  usePageHeader(
    {
      variant: "secondary",
      title: "Categorías",
      onBack: handleBack,
    },
    [handleBack]
  )

  return <FinanceCategoriesSection enabled={isEnabled} editable />
}
