import { Suspense } from "react"

import { MerchantsScreen } from "@/src/modules/finance/merchants/merchants-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function FinanceMerchantsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <MerchantsScreen />
    </Suspense>
  )
}
