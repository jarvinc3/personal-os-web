import { Suspense } from "react"

import { CardDetailScreen } from "@/src/modules/finance/cards/card-detail-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceInstitutionCardPageProps = {
  params: Promise<{ institutionId: string; cardId: string }>
}

export default async function FinanceInstitutionCardPage({
  params,
}: FinanceInstitutionCardPageProps) {
  const { cardId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <CardDetailScreen cardId={cardId} />
    </Suspense>
  )
}
