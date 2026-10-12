import { Suspense } from "react"

import { CardCreateScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceCardNewPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <CardCreateScreen />
    </Suspense>
  )
}
