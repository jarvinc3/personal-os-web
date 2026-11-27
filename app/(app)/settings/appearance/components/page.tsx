import { Suspense } from "react"

import { ComponentGalleryScreen } from "@/src/modules/galleries/components/component-gallery-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

/** Galería de componentes compartidos (#307). */
export default function ComponentGalleryPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <ComponentGalleryScreen />
    </Suspense>
  )
}
