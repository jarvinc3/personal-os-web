import { Suspense } from "react"

import { FinanceSyncOAuthClient } from "@/src/modules/finance/pages/finance-sync-oauth"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceSyncOAuthPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceSyncOAuthClient />
    </Suspense>
  )
}
