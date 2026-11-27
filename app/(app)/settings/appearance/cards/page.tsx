import { Suspense } from "react"

import { CardGalleryScreen } from "@/src/modules/galleries/cards/card-gallery-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

/** Galería de cards (#272). */
export default function CardGalleryPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <CardGalleryScreen />
    </Suspense>
  )
}
