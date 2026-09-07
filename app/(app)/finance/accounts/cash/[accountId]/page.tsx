import { Suspense } from "react";

import { CashAccountDetailClient } from "@/src/modules/finance/components/accounts/cash-account-detail-view";
import { LoadingView } from "@/src/shared/components/layout/loading-view";

type CashAccountDetailPageProps = {
  params: Promise<{ accountId: string }>
}

export default async function CashAccountDetailPage({
  params,
}: CashAccountDetailPageProps) {
  const { accountId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <CashAccountDetailClient accountId={accountId} />
    </Suspense>
  )
}
