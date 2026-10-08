"use client"

import {
  FLOATING_SHEET_CONTENT_CLASS,
  getBottomSheetDirection,
  type BottomSheetVariant,
} from "@/src/shared/components/layout/bottom-sheet-variant";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/src/shared/components/ui/drawer";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { useIsMobile } from "@/src/shared/hooks/use-mobile";
import { cn } from "@/src/shared/lib/utils";
import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean
  variant?: BottomSheetVariant
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
}

export function BottomSheet({
  open,
  variant = "default",
  onOpenChange,
  title,
  description,
  pending = false,
  children,
  headerAction,
  headerActionAlign = "end",
  actions,
}: BottomSheetProps) {
  const isMobile = useIsMobile()
  const direction = getBottomSheetDirection(variant, isMobile)
  const actionNodes = [actions?.delete, actions?.close, actions?.submit].filter(
    (node) => node != null && node !== false
  )
  return (
    <Drawer direction={direction} open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(variant === "floating" && FLOATING_SHEET_CONTENT_CLASS)}
      >
        <DrawerHeader className="relative border-b">
          <DrawerTitle className={headerAction ? "px-20" : undefined}>
            {pending ? "Cargando" : title}
          </DrawerTitle>
          {headerAction && !pending ? (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2",
                headerActionAlign === "start" ? "left-3" : "right-3",
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
          data-vaul-no-drag=""
          className="flex overflow-y-auto flex-col gap-4 p-4 scrollbar-hide"
        >
          {pending ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            children
          )}
        </div>
        
        {actionNodes.length > 0 && !pending && (
          <DrawerFooter className="flex flex-row gap-2 justify-end w-full border-t">
            {actionNodes}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
