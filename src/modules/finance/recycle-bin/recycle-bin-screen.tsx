"use client"

import { RecycleBinView } from "@/src/modules/finance/recycle-bin/components/recycle-bin-view"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function RecycleBinScreen() {
  return (
    <FinanceGate>
      <RecycleBinScreenBody />
    </FinanceGate>
  )
}

function RecycleBinScreenBody() {
  const router = useRouter()

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

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
