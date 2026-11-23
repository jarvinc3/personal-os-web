"use client"

import { useState, type ReactNode } from "react"

import { PortalContainerProvider } from "@/src/shared/context/portal-container"
import { cn } from "@/src/shared/lib/utils"

/**
 * Recuadro donde se monta un overlay abierto de la galería. El proveedor manda
 * el portal al recuadro y su transform convierte al recuadro en el contenedor
 * de los elementos fijos, así la hoja o el diálogo se ven dentro del ejemplo y
 * no tapan la página.
 */
export function OverlayFrame({
  className,
  confine = true,
  children,
}: {
  className?: string
  /** Ancla los elementos fijos al recuadro; los flotantes se dejan fuera. */
  confine?: boolean
  children: ReactNode
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  return (
    <PortalContainerProvider container={container}>
      <div
        ref={setContainer}
        data-slot="overlay-frame"
        className={cn(
          "relative isolate h-80 w-full max-w-sm [transform:translateZ(0)] overflow-hidden rounded-xl border border-border/70 bg-background",
          className
        )}
      >
        {children}
      </div>
    </PortalContainerProvider>
  )
}
