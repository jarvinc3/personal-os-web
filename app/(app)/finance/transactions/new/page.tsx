import { Suspense } from "react"
import { redirect } from "next/navigation"

import { TransactionCreateScreen } from "@/src/modules/finance"
import {
  APP_ROUTES,
  isFinanceTransferFormType,
} from "@/src/shared/constants/app-routes"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceTransactionNewPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function FinanceTransactionNewPage({
  searchParams,
}: FinanceTransactionNewPageProps) {
  const { type } = await searchParams
  if (isFinanceTransferFormType(type)) {
    redirect(APP_ROUTES.app.financeTransferNew)
  }

  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <TransactionCreateScreen />
    </Suspense>
  )
}
