import { Suspense } from "react"

import { FinanceSavingsGoalDetailClient } from "@/src/modules/finance/components/planning/finance-savings-goal-detail-view"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceSavingsGoalDetailPageProps = {
  params: Promise<{ goalId: string }>
}

export default async function FinanceSavingsGoalDetailPage({
  params,
}: FinanceSavingsGoalDetailPageProps) {
  const { goalId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceSavingsGoalDetailClient goalId={goalId} />
    </Suspense>
  )
}
