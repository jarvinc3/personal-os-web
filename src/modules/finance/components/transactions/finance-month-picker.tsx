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

function scrollChipIntoCenter(list: HTMLElement, chip: HTMLElement) {
  const listRect = list.getBoundingClientRect()
  const chipRect = chip.getBoundingClientRect()
  const left =
    list.scrollLeft +
    (chipRect.left - listRect.left) -
    (list.clientWidth - chip.clientWidth) / 2
  list.scrollTo({ left, behavior: "smooth" })
}

type FinanceMonthPickerProps = {
  months: YearMonth[]
  activeMonthKey: MonthKey
  currentMonthKey: MonthKey
  onSelect: (key: MonthKey) => void
}

export function FinanceMonthPicker({
  months,
  activeMonthKey,
  currentMonthKey,
  onSelect,
}: FinanceMonthPickerProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current
    const chip = list?.querySelector<HTMLElement>(
      `[data-month-chip="${activeMonthKey}"]`,
    )
    if (!list || !chip) return
    scrollChipIntoCenter(list, chip)
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
        const isCurrent = key === currentMonthKey
        return (
          <button
            key={key}
            type="button"
            role="tab"
            data-month-chip={key}
            aria-selected={selected}
            aria-current={isCurrent ? "date" : undefined}
            title={isCurrent ? "Mes actual" : undefined}
            onClick={() => onSelect(key)}
            className={cn(
              "snap-center shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors",
              selected
                ? "bg-foreground text-background"
                : isCurrent
                  ? "bg-muted text-foreground ring-2 ring-inset ring-foreground"
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
