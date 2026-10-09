import { Suspense } from "react"

import { FinanceCardDetailClient } from "@/src/modules/finance/components/cards/finance-card-detail-view"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceCardDetailPageProps = {
  params: Promise<{ cardId: string }>
}

export default async function FinanceCardDetailPage({
  params,
}: FinanceCardDetailPageProps) {
  const { cardId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceCardDetailClient cardId={cardId} />
    </Suspense>
  )
}
