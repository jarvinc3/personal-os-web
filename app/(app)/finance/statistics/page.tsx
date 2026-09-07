import { Suspense } from "react";

import { FinanceStatisticsClient } from "@/src/modules/finance/pages/finance-statistics";
import { LoadingView } from "@/src/shared/components/layout/loading-view";

export default function FinanceStatisticsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceStatisticsClient />
    </Suspense>
  )
}
