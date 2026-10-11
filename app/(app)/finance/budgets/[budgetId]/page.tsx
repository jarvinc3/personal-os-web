import { Suspense } from "react"

import { BudgetDetailScreen } from "@/src/modules/finance"
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
      <BudgetDetailScreen budgetId={budgetId} />
    </Suspense>
  )
}
