import { Suspense } from "react"

import { StatementImportScreen } from "@/src/modules/finance/statements/statement-import-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type FinanceStatementImportPageProps = {
  params: Promise<{ importId: string }>
}

export default async function FinanceStatementImportPage({
  params,
}: FinanceStatementImportPageProps) {
  const { importId } = await params
  return (
    <Suspense fallback={<LoadingView />}>
      <StatementImportScreen importId={importId} />
    </Suspense>
  )
}
