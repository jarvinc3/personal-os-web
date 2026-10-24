import { Suspense } from "react"

import { CardGalleryScreen } from "@/src/modules/card-gallery/card-gallery-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

/** Galería de cards (#272). */
export default function CardGalleryPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <CardGalleryScreen />
    </Suspense>
  )
}
