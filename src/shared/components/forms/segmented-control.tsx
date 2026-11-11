"use client"

import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { cn } from "@/src/shared/lib/utils"
import type { LucideIcon } from "lucide-react"

/** El preset del proyecto no trae un estado pulsado con el color primario. */
const SEGMENT_PRESSED_CLASS =
  "aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/80"

export type SegmentOption<T extends string> = {
  value: T
  label: string
  icon?: LucideIcon
}

type SegmentedControlProps<T extends string> = {
  label?: string
  /** Nombre accesible cuando no hay etiqueta visible. */
  ariaLabel?: string
  value: T
  onChange: (value: T) => void
  options: SegmentOption<T>[]
  disabled?: boolean
  error?: string
  size?: "sm" | "lg"
  fullWidth?: boolean
  orientation?: "horizontal" | "vertical"
}

/**
 * Un valor entre pocos, en píldoras. No es `Tabs`: no hay paneles ni query, el
 * estado vive en el formulario o en la pantalla que lo usa.
 */
export function SegmentedControl<T extends string>({
  label,
  ariaLabel,
  value,
  onChange,
  options,
  disabled,
  error,
  size = "sm",
  fullWidth = false,
  orientation = "horizontal",
}: SegmentedControlProps<T>) {
  return (
    <Field data-invalid={error ? true : undefined} className="gap-1">
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <ToggleGroup
        value={[value]}
        onValueChange={(next) => {
          const selected = options.find((option) => option.value === next[0])
          if (!selected) {
            return
          }
          onChange(selected.value)
        }}
        variant="outline"
        size={size === "lg" ? "lg" : "sm"}
        orientation={orientation}
        aria-label={label ?? ariaLabel}
        disabled={disabled}
        className={cn(
          fullWidth && "w-full",
          orientation === "vertical" && "flex-col items-stretch"
        )}
      >
        {options.map((option) => {
          const OptionIcon = option.icon
          return (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className={cn(
                "rounded-full",
                SEGMENT_PRESSED_CLASS,
                fullWidth && "h-11 flex-1 text-base",
                orientation === "vertical" && "w-full flex-none justify-start"
              )}
            >
              {OptionIcon ? <OptionIcon /> : null}
              {option.label}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
