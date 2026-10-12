import { Suspense } from "react"

import { TransferEditScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceTransferEditPageProps = {
  params: Promise<{ transferId: string }>
}

export default async function FinanceTransferEditPage({
  params,
}: FinanceTransferEditPageProps) {
  const { transferId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <TransferEditScreen transactionId={transferId} />
    </Suspense>
  )
}
