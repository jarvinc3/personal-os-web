"use client"

import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useRecurring } from "@/src/modules/finance/shared/hooks/use-recurring"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { RecurringPatternCard } from "@/src/modules/finance/subscriptions/components/recurring-pattern-card"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceRecurringStatus,
  FinanceRecurringPattern,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
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
  /** Stacks the sheet on top of the one that opened it. */
  nested?: boolean
}

export function RecurringArchiveSheet({
  open,
  onOpenChange,
  display,
  nested = false,
}: RecurringArchiveSheetProps) {
  const [tab, setTab] = useState<"CONFIRMED" | "DISMISSED">("CONFIRMED")
  const query = useRecurring(open, tab)
  const categoriesQuery = useCategories(open)
  const items = infiniteListItems(query.data)
  const categories = categoriesQuery.data ?? []

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      nested={nested}
      title="Bandeja de recurrentes"
      description="Cobros ya confirmados o descartados."
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cerrar
          </Button>
        ),
      }}
    >
      <FinanceSegmentedControl
        value={tab}
        onChange={setTab}
        options={ARCHIVE_TABS}
        fullWidth
      />
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
    </BottomSheet>
  )
}
