import { Suspense } from "react"

import { SubscriptionDetailScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceSubscriptionDetailPageProps = {
  params: Promise<{ subscriptionId: string }>
}

export default async function FinanceSubscriptionDetailPage({
  params,
}: FinanceSubscriptionDetailPageProps) {
  const { subscriptionId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <SubscriptionDetailScreen subscriptionId={subscriptionId} />
    </Suspense>
  )
}
