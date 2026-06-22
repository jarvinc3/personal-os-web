"use client"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/src/shared/components/ui/drawer";
import { useIsMobile } from "@/src/shared/hooks/use-mobile";
import { cn } from "@/src/shared/lib/utils";
import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  actions?: {
    delete?: ReactNode
    close?: ReactNode
    submit?: ReactNode
  }
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
}: BottomSheetProps) {
  const isMobile = useIsMobile()
  const side = isMobile ? "bottom" : "right"
  return (
    <Drawer direction={side} open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="border-b">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription
            className={cn("text-muted-foreground", description ? "":"hidden")}
          >
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-4 space-y-4 scrollbar-hide">{children}</div>
        {actions && (
          <DrawerFooter className="flex flex-row gap-2 justify-end w-full border-t">
            {actions?.delete && actions?.delete}
            {actions?.close && actions?.close}
            {actions?.submit && actions?.submit}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
