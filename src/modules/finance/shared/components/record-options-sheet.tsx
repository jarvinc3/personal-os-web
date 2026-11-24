"use client"

import type { LucideIcon } from "lucide-react"

import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { XIcon } from "lucide-react"

export type RecordOption = {
  id: string
  title: string
  description?: string
  icon: LucideIcon
  onPress: () => void
  destructive?: boolean
  disabled?: boolean
  showChevron?: boolean
}

type RecordOptionsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  options: RecordOption[]
}

export function RecordOptionsSheet({
  open,
  onOpenChange,
  title = "Opciones",
  description,
  options,
}: RecordOptionsSheetProps) {
  const regularOptions = options.filter((option) => !option.destructive)
  const destructiveOptions = options.filter((option) => option.destructive)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader title={title} description={description} />
        <SheetBody>
          {regularOptions.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {regularOptions.map((option, index) => (
                <SummaryItem
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  disabled={option.disabled}
                  showChevron={option.showChevron}
                  onPress={option.onPress}
                  isLast={index === regularOptions.length - 1}
                  className="px-3"
                />
              ))}
            </div>
          ) : null}
          {destructiveOptions.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {destructiveOptions.map((option, index) => (
                <SummaryItem
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  disabled={option.disabled}
                  showChevron={option.showChevron}
                  onPress={option.onPress}
                  isLast={index === destructiveOptions.length - 1}
                  className="px-3 text-destructive"
                />
              ))}
            </div>
          ) : null}
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
