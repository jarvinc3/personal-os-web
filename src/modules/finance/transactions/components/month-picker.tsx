"use client"

import { format } from "date-fns"
import { useLayoutEffect, useRef } from "react"

import {
  monthKey,
  type MonthKey,
  type YearMonth,
} from "@/src/modules/finance/shared/lib/month-window"
import {
  centeredScrollLeft,
  monthPickerScrollBehavior,
} from "@/src/modules/finance/transactions/lib/month-picker-scroll"
import { shortMonthLabel } from "@/src/shared/lib/date-format"
import { cn } from "@/src/shared/lib/utils"

function formatMonthPickerChip(date: Date, locale: string): string {
  return `${shortMonthLabel(date, locale)} ${format(date, "yy")}`.toUpperCase()
}

function scrollChipIntoCenter(input: {
  list: HTMLElement
  chip: HTMLElement
  behavior: ScrollBehavior
}) {
  const { list, chip, behavior } = input
  const listRect = list.getBoundingClientRect()
  const chipRect = chip.getBoundingClientRect()
  const left = centeredScrollLeft({
    listScrollLeft: list.scrollLeft,
    listLeft: listRect.left,
    listWidth: list.clientWidth,
    chipLeft: chipRect.left,
    chipWidth: chip.clientWidth,
  })
  list.scrollTo({ left, behavior })
}

type FinanceMonthPickerProps = {
  months: YearMonth[]
  activeMonthKey: MonthKey
  currentMonthKey: MonthKey
  locale: string
  onSelect: (key: MonthKey) => void
}

export function FinanceMonthPicker({
  months,
  activeMonthKey,
  currentMonthKey,
  locale,
  onSelect,
}: FinanceMonthPickerProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const hasCentered = useRef(false)

  useLayoutEffect(() => {
    const list = listRef.current
    const chip = list?.querySelector<HTMLElement>(
      `[data-month-chip="${activeMonthKey}"]`
    )
    if (!list || !chip) {
      return
    }
    scrollChipIntoCenter({
      list,
      chip,
      behavior: monthPickerScrollBehavior(hasCentered.current),
    })
    hasCentered.current = true
  }, [activeMonthKey])

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Meses"
      data-sidebar-swipe-ignore=""
      className="mx-2 flex snap-x snap-mandatory scrollbar-none gap-2 overflow-x-auto md:mx-0"
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
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(key)}
            className={cn(
              "shrink-0 cursor-pointer snap-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-300",
              selected
                ? "bg-foreground/70 text-background ring-2 ring-success ring-inset"
                : isCurrent
                  ? "text-foreground ring-2 ring-primary ring-inset"
                  : "text-muted-foreground hover:text-foreground"
            )}
          >
            {formatMonthPickerChip(date, locale)}
          </button>
        )
      })}
    </div>
  )
}
