"use client"

import {
  FLOATING_SHEET_CONTENT_CLASS,
  getBottomSheetDirection,
  WIDE_SHEET_CONTENT_CLASS,
  type BottomSheetSize,
  type BottomSheetVariant,
} from "@/src/shared/components/sheets/bottom-sheet-variant"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/src/shared/components/ui/drawer"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { useIsMobile } from "@/src/shared/hooks/use-mobile"
import { cn } from "@/src/shared/lib/utils"
import { XIcon } from "lucide-react"
import { Fragment, type ReactNode } from "react"

const DEFAULT_CLOSE_LABEL = "Cancelar"

interface BottomSheetProps {
  open: boolean
  variant?: BottomSheetVariant
  /** `wide` ensancha el drawer derecho desde `md` para mostrar dos columnas. */
  size?: BottomSheetSize
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  pending?: boolean
  children: ReactNode
  headerAction?: ReactNode
  headerActionAlign?: "start" | "end"
  actions?: {
    delete?: ReactNode
    close?: ReactNode
    submit?: ReactNode
  }
  /** Hides the default close action when the sheet has nothing to cancel. */
  showClose?: boolean
  /** Wording of the default close action, e.g. "Cerrar" on a read-only sheet. */
  closeLabel?: string
}

export function BottomSheet({
  open,
  variant = "default",
  size = "default",
  onOpenChange,
  title,
  description,
  pending = false,
  children,
  headerAction,
  headerActionAlign = "end",
  actions,
  showClose = true,
  closeLabel = DEFAULT_CLOSE_LABEL,
}: BottomSheetProps) {
  const isMobile = useIsMobile()
  const swipeDirection = getBottomSheetDirection(variant, isMobile)
  const closeAction =
    actions?.close ??
    (showClose ? (
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={() => onOpenChange(false)}
      >
        <XIcon className="size-4 shrink-0" aria-hidden="true" />
        {closeLabel}
      </Button>
    ) : null)
  const actionEntries = (
    [
      ["delete", actions?.delete],
      ["close", closeAction],
      ["submit", actions?.submit],
    ] as const
  ).filter(([, node]) => node != null && node !== false)
  return (
    <Drawer
      swipeDirection={swipeDirection}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent
        className={cn(
          variant === "floating" && FLOATING_SHEET_CONTENT_CLASS,
          variant === "default" && size === "wide" && WIDE_SHEET_CONTENT_CLASS
        )}
      >
        <DrawerHeader className="relative border-b">
          <DrawerTitle className={headerAction ? "px-20" : undefined}>
            {pending ? "Cargando" : title}
          </DrawerTitle>
          {headerAction && !pending ? (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2",
                headerActionAlign === "start" ? "left-3" : "right-3"
              )}
            >
              {headerAction}
            </div>
          ) : null}
          <DrawerDescription
            className={cn(
              "text-muted-foreground",
              !pending && description ? "" : "hidden"
            )}
          >
            {description}
          </DrawerDescription>
        </DrawerHeader>

        <div
          data-base-ui-swipe-ignore=""
          className="scrollbar-hide flex flex-col gap-4 overflow-y-auto p-4"
        >
          {pending ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            children
          )}
        </div>

        {actionEntries.length > 0 && !pending && (
          <DrawerFooter className="flex w-full flex-row justify-end gap-2 border-t">
            {actionEntries.map(([actionName, node]) => (
              <Fragment key={actionName}>{node}</Fragment>
            ))}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
