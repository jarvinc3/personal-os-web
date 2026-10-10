import { Suspense } from "react"

import { FinanceReceivableDetailClient } from "@/src/modules/finance/components/planning/finance-receivable-detail-view"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceReceivableDetailPageProps = {
  params: Promise<{ receivableId: string }>
}

export default async function FinanceReceivableDetailPage({
  params,
}: FinanceReceivableDetailPageProps) {
  const { receivableId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceReceivableDetailClient receivableId={receivableId} />
    </Suspense>
  )
}
