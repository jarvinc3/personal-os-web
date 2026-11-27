import { Suspense } from "react"

import { HomeScreen } from "@/src/modules/home/home-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <HomeScreen />
    </Suspense>
  )
}
