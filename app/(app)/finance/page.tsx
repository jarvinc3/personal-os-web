import { Suspense } from "react"

import { FinanceShellClient } from "@/src/modules/finance/pages/finance-shell-client"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinancePage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceShellClient />
    </Suspense>
  )
}
