import { Suspense } from "react"

import { MerchantDetailScreen } from "@/src/modules/finance/merchants/merchant-detail-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type FinanceMerchantDetailPageProps = {
  params: Promise<{ merchantId: string }>
}

export default async function FinanceMerchantDetailPage({
  params,
}: FinanceMerchantDetailPageProps) {
  const { merchantId } = await params
  return (
    <Suspense fallback={<LoadingView />}>
      <MerchantDetailScreen merchantId={merchantId} />
    </Suspense>
  )
}
