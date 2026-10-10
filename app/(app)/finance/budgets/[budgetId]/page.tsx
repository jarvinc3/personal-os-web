import { Suspense } from "react"

import { FinanceBudgetDetailClient } from "@/src/modules/finance/components/budgets/finance-budget-detail-view"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceBudgetDetailPageProps = {
  params: Promise<{ budgetId: string }>
}

export default async function FinanceBudgetDetailPage({
  params,
}: FinanceBudgetDetailPageProps) {
  const { budgetId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceBudgetDetailClient budgetId={budgetId} />
    </Suspense>
  )
}
