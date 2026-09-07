import { Suspense } from "react";

import { FinanceCategoriesClient } from "@/src/modules/finance/components/accounts/finance-categories-view";
import { LoadingView } from "@/src/shared/components/layout/loading-view";

export default function FinanceCategoriesPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceCategoriesClient />
    </Suspense>
  )
}
