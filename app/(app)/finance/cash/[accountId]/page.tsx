import { Suspense } from "react"

import { AccountDetailScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceCashAccountPageProps = {
  params: Promise<{ accountId: string }>
}

export default async function FinanceCashAccountPage({
  params,
}: FinanceCashAccountPageProps) {
  const { accountId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <AccountDetailScreen accountId={accountId} />
    </Suspense>
  )
}
