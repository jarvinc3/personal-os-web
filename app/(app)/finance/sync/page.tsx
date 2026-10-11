import { Suspense } from "react"

import { SyncScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceAccountsSyncPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <SyncScreen />
    </Suspense>
  )
}
