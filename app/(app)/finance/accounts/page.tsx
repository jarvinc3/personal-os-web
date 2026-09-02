import { Suspense } from "react"

import { FinanceAccountsClient } from "@/src/modules/finance/pages/finance-accounts"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceAccountsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceAccountsClient />
    </Suspense>
  )
}
