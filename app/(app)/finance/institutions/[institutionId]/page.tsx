import { Suspense } from "react"

import { InstitutionDetailScreen } from "@/src/modules/finance/institutions/institution-detail-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type InstitutionDetailPageProps = {
  params: Promise<{ institutionId: string }>
}

export default async function InstitutionDetailPage({
  params,
}: InstitutionDetailPageProps) {
  const { institutionId } = await params
  return (
    <Suspense fallback={<LoadingView />}>
      <InstitutionDetailScreen institutionId={institutionId} />
    </Suspense>
  )
}
