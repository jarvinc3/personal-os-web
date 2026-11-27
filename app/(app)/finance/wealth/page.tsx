import { Suspense } from "react"

import { WealthScreen } from "@/src/modules/finance/wealth"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function FinanceWealthPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <WealthScreen />
    </Suspense>
  )
}
