import "@ncdai/react-wheel-picker/style.css"

import * as WheelPickerPrimitive from "@ncdai/react-wheel-picker"
import type { ComponentProps, ReactNode } from "react"
import { useMemo } from "react"

import { WheelField } from "@/src/shared/components/forms/wheel-field"
import { cn } from "@/src/shared/lib/utils"
import { CalendarDaysIcon, type LucideIcon } from "lucide-react"

import {
  daysInMonth,
  durationMinutesToHm,
  hm12To24,
  hm24To12Parts,
  hmToDurationMinutes,
  HOUR12_OPTIONS,
  HOUR_DURATION_OPTIONS,
  minuteOptionsForStep,
  MONTH_OPTIONS,
  parseDate,
  PERIOD_OPTIONS,
  snapMinute,
  type MinuteStep,
  type Period,
} from "@/src/shared/types/wheels.type"

type WheelPickerValue = WheelPickerPrimitive.WheelPickerValue

type WheelPickerOption<T extends WheelPickerValue = string> =
  WheelPickerPrimitive.WheelPickerOption<T>

type WheelPickerClassNames = WheelPickerPrimitive.WheelPickerClassNames

function WheelColumn({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div
      className="flex min-w-0 flex-1 items-center"
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  )
}

function WheelPickerWrapper({
  className,
  children,
  ...props
}: ComponentProps<typeof WheelPickerPrimitive.WheelPickerWrapper>) {
  // @ncdai/WheelPickerWrapper only forwards className + children (no spread). Vaul reads
  // data-vaul-no-drag on an ancestor via closest(), so we wrap explicitly.
  return (
    <div data-vaul-no-drag="" data-sidebar-swipe-ignore="">
      <WheelPickerPrimitive.WheelPickerWrapper
        className={cn(
          // Altura de cada columna (hijos directos con data-rwp del paquete)
          "*:data-rwp:h-28.75!",
          "*:data-rwp:first:*:data-rwp-highlight-wrapper:rounded-s-md",
          "*:data-rwp:last:*:data-rwp-highlight-wrapper:rounded-e-md",
          className
        )}
        {...props}
      >
        {children}
      </WheelPickerPrimitive.WheelPickerWrapper>
    </div>
  )
}

function WheelPicker<T extends WheelPickerValue = string>({
  classNames,
  ...props
}: WheelPickerPrimitive.WheelPickerProps<T>) {
  return (
    <WheelPickerPrimitive.WheelPicker
      classNames={{
        optionItem: cn(
          "text-muted-foreground data-disabled:opacity-40",
          classNames?.optionItem
        ),
        highlightWrapper: cn(
          "bg-input/50 font-medium text-foreground",
          "data-rwp-focused:ring-2 data-rwp-focused:ring-ring data-rwp-focused:ring-inset",
          classNames?.highlightWrapper
        ),
        highlightItem: cn(
          "data-disabled:opacity-40",
          classNames?.highlightItem
        ),
      }}
      {...props}
    />
  )
}

export { WheelPicker, WheelPickerWrapper }
export type { WheelPickerClassNames, WheelPickerOption }

interface TimePairWheelsProps {
  label?: string
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  /** Minute options: every minute (`1`), every 5, or every 10. Default `1` (00–59). */
  minuteStep?: MinuteStep
}

export function TimePairWheels({
  label,
  value,
  onChange,
  disabled = false,
  minuteStep = 1,
}: TimePairWheelsProps) {
  const parsed = hm24To12Parts(value || "08:00", minuteStep)
  const minuteOptions = useMemo(
    () => minuteOptionsForStep(minuteStep),
    [minuteStep]
  )

  const commit = (next: { h12?: string; minute?: string; period?: Period }) => {
    if (disabled) {
      return
    }
    onChange(
      hm12To24(
        next.h12 ?? parsed.h12,
        next.minute ?? parsed.minute,
        next.period ?? parsed.period
      )
    )
  }

  return (
    <div
      className={cn("space-y-2", disabled && "pointer-events-none opacity-50")}
    >
      {label && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <WheelPickerWrapper className="flex w-full flex-wrap items-center justify-center gap-2 sm:flex-nowrap">
        <WheelColumn label="Hora">
          <WheelPicker
            value={parsed.h12}
            onValueChange={(h: string) => commit({ h12: h })}
            options={HOUR12_OPTIONS}
            infinite
            visibleCount={20}
          />
        </WheelColumn>
        <span className="flex items-center text-xl font-medium text-muted-foreground">
          :
        </span>
        <WheelColumn label="Minuto">
          <WheelPicker
            value={parsed.minute}
            onValueChange={(m: string) => commit({ minute: m })}
            options={minuteOptions}
            infinite
            visibleCount={20}
          />
        </WheelColumn>
        <WheelColumn label="Periodo">
          <WheelPicker
            value={parsed.period}
            onValueChange={(p: Period) => commit({ period: p })}
            options={PERIOD_OPTIONS}
            visibleCount={8}
          />
        </WheelColumn>
      </WheelPickerWrapper>
    </div>
  )
}

interface DateWheelsProps {
  label?: string
  value: string
  onChange: (next: string) => void
  minYear?: number
  maxYear?: number
  disabled?: boolean
}

export function DateWheels({
  label,
  value,
  onChange,
  minYear = new Date().getFullYear() - 2,
  maxYear = new Date().getFullYear() + 5,
  disabled = false,
}: DateWheelsProps) {
  const fallback = useMemo(() => {
    const now = new Date()
    return {
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, "0"),
      day: String(now.getDate()).padStart(2, "0"),
    }
  }, [])

  const parts = parseDate(value) ?? fallback

  const yearOptions = useMemo(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
        const year = String(minYear + index)
        return { value: year, label: year }
      }),
    [maxYear, minYear]
  )

  const dayOptions = useMemo(() => {
    const totalDays = daysInMonth(Number(parts.year), Number(parts.month))
    return Array.from({ length: totalDays }, (_, index) => {
      const day = String(index + 1).padStart(2, "0")
      return { value: day, label: day }
    })
  }, [parts.month, parts.year])

  const commit = (next: Partial<typeof parts>) => {
    if (disabled) {
      return
    }
    const merged = { ...parts, ...next }
    const maxDay = daysInMonth(Number(merged.year), Number(merged.month))
    const safeDay = Math.min(Number(merged.day), maxDay)
    const normalized = {
      ...merged,
      day: String(safeDay).padStart(2, "0"),
    }
    onChange(`${normalized.year}-${normalized.month}-${normalized.day}`)
  }

  return (
    <div
      className={cn("space-y-2", disabled && "pointer-events-none opacity-50")}
    >
      {label && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <WheelPickerWrapper className="flex w-full flex-wrap items-center justify-center gap-2 sm:flex-nowrap">
        <WheelColumn label="Día">
          <WheelPicker
            value={parts.day}
            onValueChange={(day: string) => commit({ day })}
            options={dayOptions}
            visibleCount={20}
          />
        </WheelColumn>
        <WheelColumn label="Mes">
          <WheelPicker
            value={parts.month}
            onValueChange={(month: string) => commit({ month })}
            options={MONTH_OPTIONS}
            visibleCount={20}
          />
        </WheelColumn>
        <WheelColumn label="Año">
          <WheelPicker
            value={parts.year}
            onValueChange={(year: string) => commit({ year })}
            options={yearOptions}
            visibleCount={20}
          />
        </WheelColumn>
      </WheelPickerWrapper>
    </div>
  )
}

interface DurationWheelsProps {
  label?: string
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  minuteStep?: MinuteStep
}

/** Hours + minutes of duration (`HH:mm`), without a. m./p. m. Hours 00–24. */
export function DurationWheels({
  label,
  value,
  onChange,
  disabled = false,
  minuteStep = 1,
}: DurationWheelsProps) {
  const totalMinutes = hmToDurationMinutes(value || "00:00")
  const hm = durationMinutesToHm(totalMinutes)
  const [hour, rawMinute = "00"] = hm.split(":")
  const minute = snapMinute(rawMinute, minuteStep)
  const minuteOptions = useMemo(
    () => minuteOptionsForStep(minuteStep),
    [minuteStep]
  )

  const commit = (next: { hour?: string; minute?: string }) => {
    if (disabled) {
      return
    }
    const nextHour = next.hour ?? hour
    const nextMinute = Number(nextHour) >= 24 ? "00" : (next.minute ?? minute)
    onChange(`${nextHour}:${nextMinute}`)
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {label && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <WheelPickerWrapper className="flex w-full flex-wrap items-center justify-center gap-2 sm:flex-nowrap">
        <WheelColumn label="Horas">
          <WheelPicker
            value={hour}
            onValueChange={(nextHour: string) => commit({ hour: nextHour })}
            options={HOUR_DURATION_OPTIONS}
            infinite
            visibleCount={20}
          />
        </WheelColumn>
        <span className="flex items-center text-xl font-medium text-muted-foreground">
          :
        </span>
        <WheelColumn label="Minutos">
          <WheelPicker
            value={minute}
            onValueChange={(nextMinute: string) =>
              commit({ minute: nextMinute })
            }
            options={minuteOptions}
            infinite
            visibleCount={20}
          />
        </WheelColumn>
      </WheelPickerWrapper>
    </div>
  )
}

function dayOptions(min: number, max: number) {
  const start = Math.min(min, max)
  const end = Math.max(min, max)
  return Array.from({ length: end - start + 1 }, (_, index) => {
    const day = String(start + index)
    return { value: day, label: day }
  })
}

interface DayWheelProps {
  label?: string
  /** Día elegido, en decimal (`"15"`). */
  value: string
  onChange: (next: string) => void
  min?: number
  max?: number
  disabled?: boolean
  error?: string
  icon?: LucideIcon
  /** Control junto al disparador. El panel sigue a ancho completo. */
  aside?: ReactNode
  defaultOpen?: boolean
}

function DayWheelPicker({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label?: string
  value: string
  onChange: (next: string) => void
  options: { value: string; label: string }[]
  disabled: boolean
}) {
  return (
    <div className={cn(disabled && "pointer-events-none opacity-50")}>
      <WheelPickerWrapper className="**:data-rwp:h-28.75! **:data-rwp-highlight-wrapper:rounded-md">
        <WheelColumn label={label ?? "Día"}>
          <WheelPicker
            value={value}
            onValueChange={(next: string) => {
              if (!disabled) {
                onChange(next)
              }
            }}
            options={options}
            visibleCount={16}
          />
        </WheelColumn>
      </WheelPickerWrapper>
    </div>
  )
}

/**
 * Un día del mes. La fila cerrada muestra el día; al abrirla, la rueda
 * ocupa el ancho y se confirma con Listo.
 */
export function DayWheel({
  label,
  value,
  onChange,
  min = 1,
  max = 31,
  disabled = false,
  error,
  icon = CalendarDaysIcon,
  aside,
  defaultOpen = false,
}: DayWheelProps) {
  const options = useMemo(() => dayOptions(min, max), [min, max])
  const numeric = Number(value)
  const start = Math.min(min, max)
  const end = Math.max(min, max)
  const selected =
    Number.isInteger(numeric) && numeric >= start && numeric <= end
      ? String(numeric)
      : String(start)

  return (
    <WheelField
      label={label}
      valueLabel={`Día ${selected}`}
      icon={icon}
      error={error}
      disabled={disabled}
      aside={aside}
      defaultOpen={defaultOpen}
    >
      <DayWheelPicker
        label={label}
        value={selected}
        onChange={onChange}
        options={options}
        disabled={disabled}
      />
    </WheelField>
  )
}

export default DateWheels
