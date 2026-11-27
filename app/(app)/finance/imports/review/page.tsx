import { Suspense } from "react"

import { ImportsReviewScreen } from "@/src/modules/finance/imports-review/imports-review-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function FinanceImportsReviewPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <ImportsReviewScreen />
    </Suspense>
  )
}
