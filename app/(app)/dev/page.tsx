import { Suspense } from "react"

import { DevIndexScreen } from "@/src/modules/card-gallery/dev-index-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

/** Índice de las galerías de referencia (#272). */
export default function DevIndexPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <DevIndexScreen />
    </Suspense>
  )
}
