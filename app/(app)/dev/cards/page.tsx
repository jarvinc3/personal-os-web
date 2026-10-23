import { Suspense } from "react"

import { CardGalleryScreen } from "@/src/modules/card-gallery/card-gallery-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

/** PROVISIONAL (#272): card gallery route, removed in #290. */
export default function CardGalleryPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <CardGalleryScreen />
    </Suspense>
  )
}
