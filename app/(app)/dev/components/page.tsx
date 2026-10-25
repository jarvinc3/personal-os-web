import { Suspense } from "react"

import { ComponentGalleryScreen } from "@/src/modules/component-gallery/component-gallery-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

/** Galería de componentes compartidos (#307). */
export default function ComponentGalleryPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <ComponentGalleryScreen />
    </Suspense>
  )
}
