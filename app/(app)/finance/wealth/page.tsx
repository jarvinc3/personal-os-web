import { Suspense } from "react"

import { WealthScreen } from "@/src/modules/finance/wealth"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceWealthPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <WealthScreen />
    </Suspense>
  )
}
