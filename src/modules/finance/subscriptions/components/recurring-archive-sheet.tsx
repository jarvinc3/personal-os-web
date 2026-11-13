"use client"

import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useRecurring } from "@/src/modules/finance/shared/hooks/use-recurring"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { RecurringPatternCard } from "@/src/modules/finance/subscriptions/components/recurring-pattern-card"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceRecurringStatus,
  FinanceRecurringPattern,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"

import { Spinner } from "@/src/shared/components/ui/spinner"

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
    <BottomSheet
      closeLabel="Cerrar"
      open={open}
      onOpenChange={onOpenChange}
      title="Bandeja de recurrentes"
      description="Cobros ya confirmados o descartados."
    >
      <SegmentedControl
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
