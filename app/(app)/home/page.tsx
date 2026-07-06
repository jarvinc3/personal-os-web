import { Suspense } from "react"

import { HomeClient } from "@/src/modules/home/pages/home-client"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <HomeClient />
    </Suspense>
  )
}
