import { Suspense } from "react"

import { SubscriptionsCalendarScreen } from "@/src/modules/finance/subscriptions/subscriptions-calendar-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceSubscriptionsCalendarPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <SubscriptionsCalendarScreen />
    </Suspense>
  )
}
