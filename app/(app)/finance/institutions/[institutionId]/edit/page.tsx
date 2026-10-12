import { Suspense } from "react"

import { InstitutionEditScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceInstitutionEditPageProps = {
  params: Promise<{ institutionId: string }>
}

export default async function FinanceInstitutionEditPage({
  params,
}: FinanceInstitutionEditPageProps) {
  const { institutionId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <InstitutionEditScreen institutionId={institutionId} />
    </Suspense>
  )
}
