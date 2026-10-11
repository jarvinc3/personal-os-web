import { Suspense } from "react"

import { CategoriesScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceCategoriesPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <CategoriesScreen />
    </Suspense>
  )
}
