import { Suspense } from "react";

import { InstitutionDetailClient } from "@/src/modules/finance/components/accounts/institution-detail-view";
import { LoadingView } from "@/src/shared/components/layout/loading-view";

type InstitutionDetailPageProps = {
  params: Promise<{ institutionId: string }>
}

export default async function InstitutionDetailPage({
  params,
}: InstitutionDetailPageProps) {
  const { institutionId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <InstitutionDetailClient institutionId={institutionId} />
    </Suspense>
  )
}
