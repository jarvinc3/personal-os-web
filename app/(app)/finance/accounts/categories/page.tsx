import { Suspense } from "react";

import { FinanceCategoriesClient } from "@/src/modules/finance/pages/finance-categories";
import { LoadingView } from "@/src/shared/components/layout/loading-view";

export default function FinanceCategoriesPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceCategoriesClient />
    </Suspense>
  )
}
