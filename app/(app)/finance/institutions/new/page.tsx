import { Suspense } from "react"

import { InstitutionCreateScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceInstitutionNewPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <InstitutionCreateScreen />
    </Suspense>
  )
}
