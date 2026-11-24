"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useRecurring } from "@/src/modules/finance/shared/hooks/use-recurring"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { RecurringPatternCard } from "@/src/modules/finance/subscriptions/components/recurring-pattern-card"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceRecurringStatus,
  FinanceRecurringPattern,
} from "@/src/modules/finance/shared/types/entities"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"

import { Spinner } from "@/src/shared/components/ui/spinner"
import { XIcon } from "lucide-react"

import { useState } from "react"

const ARCHIVE_TABS: {
  value: Extract<FinanceRecurringStatus, "CONFIRMED" | "DISMISSED">
  label: string
}[] = [
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "DISMISSED", label: "Descartados" },
]

type RecurringArchiveSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  display: FinanceMoneyDisplay
}

export function RecurringArchiveSheet({
  open,
  onOpenChange,
  display,
}: RecurringArchiveSheetProps) {
  const [tab, setTab] = useState<"CONFIRMED" | "DISMISSED">("CONFIRMED")
  const query = useRecurring(open, tab)
  const categoriesQuery = useCategories(open)
  const items = infiniteListItems(query.data)
  const categories = categoriesQuery.data ?? []

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Bandeja de recurrentes"
          description="Cobros ya confirmados o descartados."
        />
        <SheetBody>
          <ToggleGroup
            value={[tab]}
            onValueChange={(next) => {
              if (next.length > 0) {
                setTab(next[0])
              }
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {ARCHIVE_TABS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="h-11 flex-1 rounded-full text-base"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {query.isPending && !query.data ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : null}
          {!query.isPending && items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {tab === "CONFIRMED"
                ? "Sin recurrentes confirmados."
                : "Sin descartados."}
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            {items.map((pattern: FinanceRecurringPattern) => (
              <RecurringPatternCard
                key={pattern.id}
                pattern={pattern}
                categories={categories}
                display={display}
              />
            ))}
          </div>
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
