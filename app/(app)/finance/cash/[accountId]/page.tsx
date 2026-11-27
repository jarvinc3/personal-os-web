import { Suspense } from "react"

import { AccountDetailScreen } from "@/src/modules/finance/accounts/account-detail-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type FinanceCashAccountPageProps = {
  params: Promise<{ accountId: string }>
}

export default async function FinanceCashAccountPage({
  params,
}: FinanceCashAccountPageProps) {
  const { accountId } = await params
  return (
    <Suspense fallback={<LoadingView />}>
      <AccountDetailScreen accountId={accountId} />
    </Suspense>
  )
}
