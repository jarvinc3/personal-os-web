import { Suspense } from "react"

import { StatementImportScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceStatementImportPageProps = {
  params: Promise<{ importId: string }>
}

export default async function FinanceStatementImportPage({
  params,
}: FinanceStatementImportPageProps) {
  const { importId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <StatementImportScreen importId={importId} />
    </Suspense>
  )
}
