import { Suspense } from "react"

import { CardCreateScreen } from "@/src/modules/finance/cards/card-form-pages"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function FinanceCardNewPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <CardCreateScreen />
    </Suspense>
  )
}
