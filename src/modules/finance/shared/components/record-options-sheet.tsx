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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { cn } from "@/src/shared/lib/utils"
import { ChevronRightIcon, XIcon } from "lucide-react"

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
              {regularOptions.map((option, index) => {
                const OptionIcon = option.icon
                return (
                  <Item
                    key={option.id}
                    variant={option.disabled ? "plain" : "default"}
                    className={cn(
                      "px-3",
                      option.disabled &&
                        index !== regularOptions.length - 1 &&
                        "border-b border-border/60",
                      option.disabled && "opacity-50"
                    )}
                    aria-disabled={option.disabled || undefined}
                    render={
                      option.disabled ? undefined : (
                        <button type="button" onClick={option.onPress} />
                      )
                    }
                  >
                    <ItemMedia variant="icon">
                      <OptionIcon />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{option.title}</ItemTitle>
                      <ItemDescription className="truncate text-xs">
                        {option.description}
                      </ItemDescription>
                    </ItemContent>
                    {!option.disabled && option.showChevron ? (
                      <ItemActions>
                        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                      </ItemActions>
                    ) : null}
                  </Item>
                )
              })}
            </div>
          ) : null}
          {destructiveOptions.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {destructiveOptions.map((option, index) => {
                const OptionIcon = option.icon
                return (
                  <Item
                    key={option.id}
                    variant={option.disabled ? "plain" : "default"}
                    className={cn(
                      "px-3",
                      option.disabled &&
                        index !== destructiveOptions.length - 1 &&
                        "border-b border-border/60",
                      "text-destructive",
                      option.disabled && "opacity-50"
                    )}
                    aria-disabled={option.disabled || undefined}
                    render={
                      option.disabled ? undefined : (
                        <button type="button" onClick={option.onPress} />
                      )
                    }
                  >
                    <ItemMedia variant="icon">
                      <OptionIcon />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{option.title}</ItemTitle>
                      <ItemDescription className="truncate text-xs">
                        {option.description}
                      </ItemDescription>
                    </ItemContent>
                    {!option.disabled && option.showChevron ? (
                      <ItemActions>
                        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                      </ItemActions>
                    ) : null}
                  </Item>
                )
              })}
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
