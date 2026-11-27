"use client"

import { RecycleBinView } from "@/src/modules/finance/recycle-bin/components/recycle-bin-view"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useBackTo } from "@/src/shared/hooks/use-back-to"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

export function RecycleBinScreen() {
  return (
    <FinanceGate>
      <RecycleBinScreenBody />
    </FinanceGate>
  )
}

function RecycleBinScreenBody() {
  const handleBack = useBackTo(APP_ROUTES.app.financeProducts)

  usePageHeader(
    {
      variant: "secondary",
      title: "Papelera de reciclaje",
      onBack: handleBack,
    },
    [handleBack]
  )

  return <RecycleBinView />
}
