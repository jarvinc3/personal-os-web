"use client"

import {
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/src/shared/components/ui/field"
import { cn } from "@/src/shared/lib/utils"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type OptionRowProps = {
  label: string
  description?: string
  selected?: boolean
  onPress?: () => void
  trailing?: ReactNode
  icon?: LucideIcon
  iconColor?: string
  accentColor?: string
}

export function OptionRow({
  label,
  description,
  selected,
  onPress,
  trailing,
  icon: Icon,
  iconColor,
  accentColor,
}: OptionRowProps) {
  return (
    <FieldLabel
      onClick={onPress}
      className={cn(
        "flex w-full cursor-pointer flex-row items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-100 ease-in-out hover:bg-card/70 active:scale-[0.99] active:bg-muted/80",
        selected ? `border bg-card/50` : "border-border bg-card"
      )}
      style={selected ? { borderColor: accentColor } : undefined}
    >
      {Icon && (
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: iconColor ? `${iconColor}1a` : undefined }}
        >
          <Icon className="size-4.5" style={{ color: iconColor }} />
        </div>
      )}
      <FieldContent>
        <FieldTitle className="text-sm">{label}</FieldTitle>
        <FieldDescription className="text-xs text-muted-foreground">
          {description}
        </FieldDescription>
      </FieldContent>
      {trailing}
    </FieldLabel>
  )
}
