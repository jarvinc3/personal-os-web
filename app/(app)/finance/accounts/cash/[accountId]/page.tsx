import { Suspense } from "react";

import { FinanceAccountDetailClient } from "@/src/modules/finance/components/accounts/finance-account-detail-view";
import { LoadingView } from "@/src/shared/components/layout/loading-view";

type FinanceAccountDetailPageProps = {
  params: Promise<{ accountId: string }>
}

export default async function FinanceAccountDetailPage({
  params,
}: FinanceAccountDetailPageProps) {
  const { accountId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceAccountDetailClient accountId={accountId} />
    </Suspense>
  )
}
