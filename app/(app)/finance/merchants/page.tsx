import { Suspense } from "react"

import { MerchantsScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceMerchantsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <MerchantsScreen />
    </Suspense>
  )
}
