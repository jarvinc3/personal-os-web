"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { DayWheel } from "@/src/shared/components/forms/wheel-picker"
import {
  CalendarDays,
  PlusIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"

type DayListFieldProps = {
  label: string
  /** Días separados por coma o espacio. El orden de la lista se conserva al editar. */
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  error?: string
  disabled?: boolean
  icon?: LucideIcon
}

function readDays(value: string, min: number, max: number): number[] {
  const seen = new Set<number>()
  const days: number[] = []
  for (const part of value.split(/[,\s]+/)) {
    const day = Number(part.trim())
    if (!Number.isInteger(day) || day < min || day > max || seen.has(day)) {
      continue
    }
    seen.add(day)
    days.push(day)
  }
  return days
}

function nextFreeDay(days: number[], min: number, max: number): number | null {
  const used = new Set(days)
  if (used.size >= max - min + 1) {
    return null
  }
  const start = days.length > 0 ? Math.max(...days) + 1 : min
  if (start <= max && !used.has(start)) {
    return start
  }
  for (let day = min; day <= max; day += 1) {
    if (!used.has(day)) {
      return day
    }
  }
  return null
}

/** Lista de días del mes. Cada día se abre como el campo de fecha. */
export function DayListField({
  label,
  value,
  onChange,
  min = 1,
  max = 31,
  error,
  disabled = false,
  icon: Icon = CalendarDays,
}: DayListFieldProps) {
  const days = readDays(value, min, max)
  const [openedOnAdd, setOpenedOnAdd] = useState<number | null>(null)
  const nextDay = nextFreeDay(days, min, max)

  function commit(next: number[]) {
    onChange(next.join(", "))
  }

  return (
    <Field
      data-invalid={error ? true : undefined}
      data-disabled={disabled ? true : undefined}
      className="gap-1"
    >
      <FieldLabel className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden />
        {label}
      </FieldLabel>
      <div className="flex flex-col gap-2">
        {days.map((day, index) => (
          <DayWheel
            key={index}
            value={String(day)}
            min={min}
            max={max}
            disabled={disabled}
            defaultOpen={openedOnAdd === index}
            aside={
              days.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Quitar día ${day}`}
                  disabled={disabled}
                  onClick={() => {
                    commit(days.filter((_, itemIndex) => itemIndex !== index))
                    setOpenedOnAdd(null)
                  }}
                >
                  <Trash2Icon />
                </Button>
              ) : null
            }
            onChange={(next) => {
              const nextDayValue = Number(next)
              if (days.includes(nextDayValue) && days[index] !== nextDayValue) {
                return
              }
              const nextDays = [...days]
              nextDays[index] = nextDayValue
              commit(nextDays)
            }}
          />
        ))}
        {nextDay !== null ? (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              commit([...days, nextDay])
              setOpenedOnAdd(days.length)
            }}
          >
            <PlusIcon data-icon="inline-start" />
            Agregar día
          </Button>
        ) : null}
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
