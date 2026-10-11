"use client"

import { FinanceCategoriesSection } from "@/src/modules/finance/catalog/components/categories-section"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function CategoriesScreen() {
  return (
    <FinanceGate>
      <CategoriesScreenBody />
    </FinanceGate>
  )
}

function CategoriesScreenBody() {
  const router = useRouter()
  const { isEnabled } = useFinanceEnabled()

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

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
