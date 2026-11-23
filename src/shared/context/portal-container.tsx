"use client"

import {
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
} from "react"

/** Lo que acepta el `container` del portal de Base UI. */
export type PortalContainerProp =
  | HTMLElement
  | ShadowRoot
  | RefObject<HTMLElement | ShadowRoot | null>
  | null
  | undefined

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

/**
 * Contenedor del portal: gana el explícito y, si no hay, el del proveedor.
 * Sin ninguno, el primitivo usa `document.body`.
 */
export function usePortalContainer(
  container?: PortalContainerProp
): PortalContainerProp {
  const inheritedContainer = useContext(PortalContainerContext)
  return container ?? inheritedContainer
}
