"use client"

import type { LucideIcon } from "lucide-react"

import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { SummaryItem } from "@/src/shared/components/ui/summary"

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
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      {regularOptions.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {regularOptions.map((option, index) => (
            <SummaryItem
              key={option.id}
              title={option.title}
              description={option.description}
              icon={option.icon}
              disabled={option.disabled}
              showChevron={option.showChevron}
              onPress={option.onPress}
              isLast={index === regularOptions.length - 1}
              className="px-3"
            />
          ))}
        </div>
      ) : null}
      {destructiveOptions.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {destructiveOptions.map((option, index) => (
            <SummaryItem
              key={option.id}
              title={option.title}
              description={option.description}
              icon={option.icon}
              disabled={option.disabled}
              showChevron={option.showChevron}
              onPress={option.onPress}
              isLast={index === destructiveOptions.length - 1}
              className="px-3 text-destructive"
            />
          ))}
        </div>
      ) : null}
    </BottomSheet>
  )
}
