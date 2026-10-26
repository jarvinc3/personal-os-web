import { Suspense } from "react"

import { CategoriesScreen } from "@/src/modules/finance/catalog/categories-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function FinanceCategoriesPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <CategoriesScreen />
    </Suspense>
  )
}
