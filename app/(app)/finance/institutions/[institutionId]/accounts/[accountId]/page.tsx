import { Suspense } from "react"

import { AccountDetailScreen } from "@/src/modules/finance/accounts/account-detail-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type FinanceInstitutionAccountPageProps = {
  params: Promise<{ institutionId: string; accountId: string }>
}

export default async function FinanceInstitutionAccountPage({
  params,
}: FinanceInstitutionAccountPageProps) {
  const { accountId } = await params
  return (
    <Suspense fallback={<LoadingView />}>
      <AccountDetailScreen accountId={accountId} />
    </Suspense>
  )
}
