import { Suspense } from "react"

import { FinancePlanningClient } from "@/src/modules/finance/pages/finance-planning"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinancePlanningPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinancePlanningClient />
    </Suspense>
  )
}
