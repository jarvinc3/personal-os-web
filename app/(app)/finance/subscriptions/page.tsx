import { Suspense } from "react"

import { SubscriptionsScreen } from "@/src/modules/finance/subscriptions/subscriptions-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceSubscriptionsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <SubscriptionsScreen />
    </Suspense>
  )
}
