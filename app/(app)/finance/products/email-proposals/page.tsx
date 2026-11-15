import { Suspense } from "react"

import { ProductProposalsScreen } from "@/src/modules/finance/product-proposals/proposals-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function FinanceProductsEmailProposalsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <ProductProposalsScreen />
    </Suspense>
  )
}
