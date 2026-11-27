import { Suspense } from "react"

import { ProductsScreen } from "@/src/modules/finance/products/products-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function FinanceProductsPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <ProductsScreen />
    </Suspense>
  )
}
