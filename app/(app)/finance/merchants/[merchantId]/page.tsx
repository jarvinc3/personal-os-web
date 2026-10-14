import { Suspense } from "react"

import { MerchantDetailScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceMerchantDetailPageProps = {
  params: Promise<{ merchantId: string }>
}

export default async function FinanceMerchantDetailPage({
  params,
}: FinanceMerchantDetailPageProps) {
  const { merchantId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <MerchantDetailScreen merchantId={merchantId} />
    </Suspense>
  )
}
