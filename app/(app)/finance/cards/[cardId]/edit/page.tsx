import { Suspense } from "react"

import { CardEditScreen } from "@/src/modules/finance/cards/card-form-pages"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceCardEditPageProps = {
  params: Promise<{ cardId: string }>
}

export default async function FinanceCardEditPage({
  params,
}: FinanceCardEditPageProps) {
  const { cardId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <CardEditScreen cardId={cardId} />
    </Suspense>
  )
}
