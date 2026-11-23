"use client"

import { createContext, useContext, type ReactNode } from "react"

const PortalContainerContext = createContext<HTMLElement | null>(null)

/**
 * Monta los portales de hojas, diálogos y menús dentro de un elemento en vez
 * de `document.body`. La galería lo usa para pintar cada overlay abierto en su
 * recuadro; sin proveedor, el portal sigue yendo al final del documento.
 */
export function PortalContainerProvider({
  container,
  children,
}: {
  container: HTMLElement | null
  children: ReactNode
}) {
  return (
    <PortalContainerContext.Provider value={container}>
      {children}
    </PortalContainerContext.Provider>
  )
}

export function usePortalContainer(): HTMLElement | null {
  return useContext(PortalContainerContext)
}
