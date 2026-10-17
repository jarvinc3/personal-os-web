import { Suspense } from "react"

import { PlanningScreen } from "@/src/modules/finance/planning/planning-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinancePlanningPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <PlanningScreen />
    </Suspense>
  )
}
