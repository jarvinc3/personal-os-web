import { Suspense } from "react"

import { ReceivableDetailScreen } from "@/src/modules/finance/receivables/receivable-detail-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type FinanceReceivableDetailPageProps = {
  params: Promise<{ receivableId: string }>
}

export default async function FinanceReceivableDetailPage({
  params,
}: FinanceReceivableDetailPageProps) {
  const { receivableId } = await params
  return (
    <Suspense fallback={<LoadingView />}>
      <ReceivableDetailScreen receivableId={receivableId} />
    </Suspense>
  )
}
