"use client"

import {
  SUBSCRIPTION_SORTS,
  SUBSCRIPTION_SORT_LABEL,
  type SubscriptionSort,
} from "@/src/modules/finance/subscriptions/lib/subscription-filters"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import { Card } from "@/src/shared/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"

import {
  ArrowDownWideNarrowIcon,
  CalendarClockIcon,
  ChevronRightIcon,
  CheckIcon,
  HashIcon,
  SortAscIcon,
  XIcon,
} from "lucide-react"

const SORT_ICON = {
  NEXT_DATE: CalendarClockIcon,
  AMOUNT: HashIcon,
  NAME: SortAscIcon,
} as const

type SubscriptionSortSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: SubscriptionSort
  onChange: (next: SubscriptionSort) => void
}

/** Order of the subscription list. Applied by the API, not by the client. */
export function SubscriptionSortSheet({
  open,
  onOpenChange,
  value,
  onChange,
}: SubscriptionSortSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader title="Ordenar por" />
        <SheetBody>
          <section className="flex flex-col gap-2">
            <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Ordenar por
            </h2>
            <Card className="gap-0 bg-card p-1">
              <ItemGroup className="gap-0 divide-y divide-border/60">
                {SUBSCRIPTION_SORTS.map((sort) => {
                  const SortIcon = SORT_ICON[sort]
                  return (
                    <Item
                      key={sort}
                      variant="plain"
                      className="min-h-[52px] px-3 py-3"
                      render={
                        <button
                          type="button"
                          onClick={() => {
                            onChange(sort)
                            onOpenChange(false)
                          }}
                        />
                      }
                    >
                      <ItemMedia className="size-9 rounded-md bg-muted">
                        <SortIcon className="size-4.5" />
                      </ItemMedia>
                      <ItemContent className="gap-0.5">
                        <ItemTitle className="text-sm font-normal md:text-base">
                          {SUBSCRIPTION_SORT_LABEL[sort]}
                        </ItemTitle>
                      </ItemContent>
                      <ItemActions>
                        {sort === value ? (
                          <CheckIcon
                            className="size-4 text-primary"
                            aria-hidden
                          />
                        ) : null}
                        <ChevronRightIcon className="size-4.5 text-muted-foreground" />
                      </ItemActions>
                    </Item>
                  )
                })}
              </ItemGroup>
            </Card>
          </section>
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <ArrowDownWideNarrowIcon className="size-3.5" aria-hidden />
            El orden se aplica a toda la lista, no solo a lo cargado.
          </p>
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
