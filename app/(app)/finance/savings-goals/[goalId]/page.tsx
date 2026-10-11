import { Suspense } from "react"

import { SavingsGoalDetailScreen } from "@/src/modules/finance"
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
      <SavingsGoalDetailScreen goalId={goalId} />
    </Suspense>
  )
}
