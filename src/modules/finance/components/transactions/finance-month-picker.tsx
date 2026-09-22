"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale/es"
import { useEffect, useRef } from "react"

import { cn } from "@/src/shared/lib/utils"
import {
  monthKey,
  type MonthKey,
  type YearMonth,
} from "@/src/modules/finance/lib/month-window"

function formatMonthPickerChip(date: Date): string {
  return format(date, "MMM yy", { locale: es }).replace(/\./g, "").toUpperCase()
}

type FinanceMonthPickerProps = {
  months: YearMonth[]
  activeMonthKey: MonthKey
  onSelect: (key: MonthKey) => void
}

export function FinanceMonthPicker({
  months,
  activeMonthKey,
  onSelect,
}: FinanceMonthPickerProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const chip = listRef.current?.querySelector<HTMLElement>(
      `[data-month-chip="${activeMonthKey}"]`,
    )
    chip?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    })
  }, [activeMonthKey])

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Meses"
      className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      {months.map((slot) => {
        const key = monthKey(slot.year, slot.month)
        const date = new Date(slot.year, slot.month - 1, 1)
        const selected = key === activeMonthKey
        return (
          <button
            key={key}
            type="button"
            role="tab"
            data-month-chip={key}
            aria-selected={selected}
            onClick={() => onSelect(key)}
            className={cn(
              "snap-center shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors",
              selected
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {formatMonthPickerChip(date)}
          </button>
        )
      })}
    </div>
  )
}
