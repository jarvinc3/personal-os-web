import { Suspense } from "react"

import { InstitutionDetailScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type InstitutionDetailPageProps = {
  params: Promise<{ institutionId: string }>
}

export default async function InstitutionDetailPage({
  params,
}: InstitutionDetailPageProps) {
  const { institutionId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <InstitutionDetailScreen institutionId={institutionId} />
    </Suspense>
  )
}
