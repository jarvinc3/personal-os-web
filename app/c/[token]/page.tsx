import type { Metadata } from "next"
import { Suspense } from "react"

import { PublicReceivableShareScreen } from "@/src/modules/finance/receivables/public-share-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export const metadata: Metadata = {
  title: "Cobros compartidos",
  robots: { index: false, follow: false },
}

type PublicReceivableSharePageProps = {
  params: Promise<{ token: string }>
}

export default async function PublicReceivableSharePage({
  params,
}: PublicReceivableSharePageProps) {
  const { token } = await params
  return (
    <Suspense fallback={<LoadingView />}>
      <PublicReceivableShareScreen token={token} />
    </Suspense>
  )
}
