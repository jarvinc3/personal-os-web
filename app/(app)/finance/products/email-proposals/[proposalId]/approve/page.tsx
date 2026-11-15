import { Suspense } from "react"

import { ProposalApprovalScreen } from "@/src/modules/finance/product-proposals/proposal-approval-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type FinanceProductProposalApprovalPageProps = {
  params: Promise<{ proposalId: string }>
}

export default async function FinanceProductProposalApprovalPage({
  params,
}: FinanceProductProposalApprovalPageProps) {
  const { proposalId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <ProposalApprovalScreen proposalId={proposalId} />
    </Suspense>
  )
}
