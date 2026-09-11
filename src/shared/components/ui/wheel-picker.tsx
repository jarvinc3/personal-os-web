import "@ncdai/react-wheel-picker/style.css";

import * as WheelPickerPrimitive from "@ncdai/react-wheel-picker";
import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";

import { cn } from "@/src/shared/lib/utils";

import {
  daysInMonth,
  hm12To24,
  hm24To12Parts,
  HOUR12_OPTIONS,
  MINUTE_OPTIONS,
  MONTH_OPTIONS,
  parseDate,
  PERIOD_OPTIONS,
  type Period,
} from "@/src/shared/types/wheels.type";

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
    <div className="min-w-0 flex-1" role="group" aria-label={label}>
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
    <div data-vaul-no-drag="">
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
          "bg-input/50 text-foreground font-medium",
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

export { WheelPicker, WheelPickerWrapper };
export type { WheelPickerClassNames, WheelPickerOption };

interface TimePairWheelsProps {
  label?: string
  value: string
  onChange: (next: string) => void
  disabled?: boolean
}

export function TimePairWheels({
  label,
  value,
  onChange,
  disabled = false,
}: TimePairWheelsProps) {
  const parsed = hm24To12Parts(value || "08:00")

  const commit = (next: { h12?: string; minute?: string; period?: Period }) => {
    if (disabled) return
    onChange(
      hm12To24(
        next.h12 ?? parsed.h12,
        next.minute ?? parsed.minute,
        next.period ?? parsed.period
      )
    )
  }

  return (
    <div className={cn("space-y-2", disabled && "pointer-events-none opacity-50")}>
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
            options={MINUTE_OPTIONS}
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
    if (disabled) return
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
    <div className={cn("space-y-2", disabled && "pointer-events-none opacity-50")}>
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

export default DateWheels
