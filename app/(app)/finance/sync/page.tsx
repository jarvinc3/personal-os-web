import { Suspense } from "react"

import { FinanceSyncClient } from "@/src/modules/finance/pages/finance-sync"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceSyncPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceSyncClient />
    </Suspense>
  )
}
