"use client"

import { cn } from "@/src/shared/lib/utils"
import type { ReactNode } from "react"

type SelectionGridProps<T> = {
  items: T[]
  value: string
  onValueChange: (value: string) => void
  getItemKey: (item: T) => string
  getItemValue: (item: T) => string
  getItemLabel?: (item: T) => string
  renderCell: (item: T) => ReactNode
}

export function SelectionGrid<T>({
  items,
  value,
  onValueChange,
  getItemKey,
  getItemValue,
  getItemLabel,
  renderCell,
}: SelectionGridProps<T>) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => {
        const itemValue = getItemValue(item)
        const selected = value === itemValue
        return (
          <button
            key={getItemKey(item)}
            type="button"
            aria-label={getItemLabel?.(item)}
            aria-pressed={selected}
            onClick={() => onValueChange(itemValue)}
            className={cn(
              "aspect-square overflow-hidden rounded-xl border-2",
              selected ? "border-primary" : "border-transparent"
            )}
          >
            {renderCell(item)}
          </button>
        )
      })}
    </div>
  )
}
