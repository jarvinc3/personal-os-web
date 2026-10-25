"use client"

import { FieldLabel } from "@/src/shared/components/ui/field"
import { Switch } from "@/src/shared/components/ui/switch"
import type { LucideIcon } from "lucide-react"
import { useId } from "react"

type SwitchFieldRowProps = {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  icon: LucideIcon
  iconColor?: string
  accentColor?: string
}

export function SwitchFieldRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  icon: Icon,
  iconColor,
  accentColor,
}: SwitchFieldRowProps) {
  const id = useId()
  return (
    <div
      className="flex flex-row items-center justify-between gap-3 rounded-xl border bg-card px-3 py-3"
      style={checked ? { borderColor: accentColor, borderWidth: 1 } : undefined}
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: iconColor ? `${iconColor}1a` : undefined }}
      >
        <Icon className="size-4.5" style={{ color: iconColor }} />
      </div>
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <FieldLabel className="text-sm">{label}</FieldLabel>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}
