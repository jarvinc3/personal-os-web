"use client"

import { Field, FieldError } from "@/src/shared/components/ui/field"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { cn } from "@/src/shared/lib/utils"
import { type LucideIcon } from "lucide-react"

export type ChoiceGridOption<T extends string> = {
  value: T
  label: string
  icon: LucideIcon
}

type ChoiceGridProps<T extends string> = {
  value: T
  onValueChange: (value: T) => void
  options: readonly ChoiceGridOption<T>[]
  /** Nombre accesible del grupo. La sección ya muestra el título visible. */
  ariaLabel: string
  /** Color del módulo. Pinta el icono, su fondo y el borde de la opción elegida. */
  accentColor: string
  /** Fuerza las columnas. Siete o más apilan icono y nombre. */
  columns?: number
  error?: string
  disabled?: boolean
}

/**
 * Elección exclusiva en celdas. Para pocas opciones cuyo nombre basta,
 * sin descripción debajo.
 */
export function ChoiceGrid<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  accentColor,
  columns,
  error,
  disabled = false,
}: ChoiceGridProps<T>) {
  const stacked = columns != null && columns >= 5

  return (
    <Field
      data-invalid={error ? true : undefined}
      data-disabled={disabled ? true : undefined}
      className="gap-1"
    >
      <RadioGroup
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          const selected = options.find((option) => option.value === next)
          if (selected) {
            onValueChange(selected.value)
          }
        }}
        className={cn(
          "grid gap-2",
          columns == null && "grid-cols-[repeat(auto-fit,minmax(7rem,1fr))]"
        )}
        style={
          columns != null
            ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {options.map((option) => {
          const Icon = option.icon
          const selected = option.value === value
          return (
            <RadioGroupItem
              key={option.value}
              value={option.value}
              aria-label={option.label}
              className={cn(
                "relative flex aspect-auto h-auto min-h-11 w-full items-center rounded-xl border border-border bg-card px-2 py-2 text-foreground",
                "after:hidden **:data-[slot=radio-group-indicator]:hidden",
                "hover:bg-muted/40 data-checked:bg-card data-checked:text-foreground dark:data-checked:bg-card"
              )}
              style={selected ? { borderColor: accentColor } : undefined}
            >
              <span
                className={cn(
                  "flex w-full items-center",
                  stacked ? "flex-col gap-1" : "gap-2"
                )}
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${accentColor}1a` }}
                >
                  <Icon
                    className="size-4"
                    style={{ color: accentColor }}
                    aria-hidden
                  />
                </span>
                <span
                  className={cn(
                    "truncate font-medium",
                    stacked ? "text-xs" : "text-sm"
                  )}
                >
                  {option.label}
                </span>
              </span>
            </RadioGroupItem>
          )
        })}
      </RadioGroup>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
