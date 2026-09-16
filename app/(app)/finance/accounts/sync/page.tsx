import { Suspense } from "react"

import { FinanceMailboxesClient } from "@/src/modules/finance/pages/finance-sync"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceAccountsSyncPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceMailboxesClient />
    </Suspense>
  )
}
