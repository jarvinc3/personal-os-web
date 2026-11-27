"use client"

import { Spinner } from "@/src/shared/components/ui/spinner"

/** Fallback de Suspense de una ruta: la página todavía no tiene forma. */
export function LoadingView() {
  return (
    <div className="flex min-h-screen w-full flex-1 items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
}
