"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { useRecurring } from "@/src/modules/finance/shared/hooks/use-recurring"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { recurringFrequencyLabel } from "@/src/modules/finance/subscriptions/lib/recurring-display"
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
  display: { currency: string; showCents: boolean; compactNumbers: boolean }
}

export function RecurringArchiveSheet({
  open,
  onOpenChange,
  display,
}: RecurringArchiveSheetProps) {
  const [tab, setTab] = useState<"CONFIRMED" | "DISMISSED">("CONFIRMED")
  const query = useRecurring(open, tab)
  const items = infiniteListItems(query.data)

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
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
          <div
            key={pattern.id}
            className="flex items-center gap-3 rounded-2xl border border-border p-3"
          >
            <BrandLogo
              name={pattern.merchantName}
              logoUrl={pattern.logoUrl}
              size={32}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {pattern.merchantName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {formatFinanceMoney(pattern.avgAmount, {
                  ...display,
                  currency: pattern.currency,
                })}{" "}
                · {recurringFrequencyLabel(pattern.frequency).toLowerCase()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  )
}
