"use client"

import {
  FLOATING_SHEET_CONTENT_CLASS,
  getBottomSheetDirection,
  type BottomSheetVariant,
} from "@/src/shared/components/layout/bottom-sheet-variant"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/src/shared/components/ui/drawer"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { useIsMobile } from "@/src/shared/hooks/use-mobile"
import { cn } from "@/src/shared/lib/utils"
import type { ReactNode } from "react"

interface BottomSheetProps {
  open: boolean
  variant?: BottomSheetVariant
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  pending?: boolean
  children: ReactNode
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
  actions,
}: BottomSheetProps) {
  const isMobile = useIsMobile()
  const direction = getBottomSheetDirection(variant, isMobile)
  return (
    <Drawer direction={direction} open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(variant === "floating" && FLOATING_SHEET_CONTENT_CLASS)}
      >
        <DrawerHeader className="border-b">
          <DrawerTitle>{pending ? "Cargando" : title}</DrawerTitle>
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
        {actions && !pending && (
          <DrawerFooter className="flex w-full flex-row justify-end gap-2 border-t">
            {actions?.delete && actions?.delete}
            {actions?.close && actions?.close}
            {actions?.submit && actions?.submit}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
