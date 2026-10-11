import { Suspense } from "react"

import { ReceivableDetailScreen } from "@/src/modules/finance"
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
      <ReceivableDetailScreen receivableId={receivableId} />
    </Suspense>
  )
}
