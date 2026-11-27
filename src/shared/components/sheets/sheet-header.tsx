"use client"

import {
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/src/shared/components/ui/drawer"
import { cn } from "@/src/shared/lib/utils"
import type { ReactNode, Ref } from "react"

type SheetHeaderProps = {
  title: string
  description?: string
  pending?: boolean
  /** Acciones del borde derecho: ayuda, un botón propio de la hoja. */
  actions?: ReactNode
  /** Acción del borde izquierdo; el título deja lugar para ella. */
  startAction?: ReactNode
  titleRef?: Ref<HTMLHeadingElement>
  titleTabIndex?: -1
}

/**
 * Cabecera de una hoja de producto. No envuelve el Drawer: cada pantalla
 * compone `Drawer`, `DrawerContent` y su pie; esto solo repite el título, la
 * descripción y el espacio de acciones.
 */
export function SheetHeader({
  title,
  description,
  pending = false,
  actions,
  startAction,
  titleRef,
  titleTabIndex,
}: SheetHeaderProps) {
  const showActions = Boolean(actions) && !pending
  const showStartAction = Boolean(startAction) && !pending

  return (
    <DrawerHeader className="relative pb-4">
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col -space-y-2">
          <DrawerTitle
            ref={titleRef}
            tabIndex={titleTabIndex}
            className={cn(showStartAction && "px-20")}
          >
            {pending ? "Cargando" : title}
          </DrawerTitle>
          <DrawerDescription
            className={cn(
              "text-muted-foreground",
              !pending && description ? "" : "hidden"
            )}
          >
            {description}
          </DrawerDescription>
        </div>
        {showActions ? (
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        ) : null}
      </div>
      {showStartAction ? (
        <div className="absolute top-1/2 left-3 -translate-y-1/2">
          {startAction}
        </div>
      ) : null}
    </DrawerHeader>
  )
}
