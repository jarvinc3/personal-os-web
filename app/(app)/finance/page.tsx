import { Suspense } from "react";

import { FinanceOverviewClient } from "@/src/modules/finance/pages/finance-overview";
import { LoadingView } from "@/src/shared/components/layout/loading-view";

export default function FinancePage() {
  return (
    <Suspense fallback={<LoadingView variant="inline" />}>
      <FinanceOverviewClient />
    </Suspense>
  )
}
