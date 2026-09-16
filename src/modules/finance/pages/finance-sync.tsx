"use client"

import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { FinanceMailboxesView } from "@/src/modules/finance/components/accounts/finance-mailboxes-view"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function FinanceMailboxesClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinanceMailboxesPage />
    </FinanceAuthenticatedPage>
  )
}

function FinanceMailboxesPage() {
  const router = useRouter()
  const { isEnabled } = useFinanceEnabled()

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.financeAccounts)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Correos",
      onBack: handleBack,
    },
    [handleBack],
  )

  return <FinanceMailboxesView enabled={isEnabled} />
}
