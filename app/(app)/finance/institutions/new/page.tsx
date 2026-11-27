import { Suspense } from "react"

import { InstitutionCreateScreen } from "@/src/modules/finance/institutions/institution-form-pages"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function FinanceInstitutionNewPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <InstitutionCreateScreen />
    </Suspense>
  )
}
