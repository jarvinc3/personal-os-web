"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceMailboxesView } from "@/src/modules/finance/sync/components/mailboxes-view"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function SyncScreen() {
  return (
    <FinanceGate>
      <SyncScreenBody />
    </FinanceGate>
  )
}

function SyncScreenBody() {
  const router = useRouter()
  const { isEnabled } = useFinanceEnabled()

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Correos",
      onBack: handleBack,
    },
    [handleBack]
  )

  return <FinanceMailboxesView enabled={isEnabled} />
}
