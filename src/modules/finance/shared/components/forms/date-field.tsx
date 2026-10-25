"use client"

import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import {
  formatCalendarDate,
  nowDateTimeInput,
  todayDateInput,
} from "@/src/modules/finance/shared/lib/ledger-form"
import { Button } from "@/src/shared/components/ui/button"
import {
  DateWheels,
  TimePairWheels,
} from "@/src/shared/components/forms/wheel-picker"
import { WheelField } from "@/src/shared/components/forms/wheel-field"
import { formatHm24Display12h, parseDate } from "@/src/shared/types/wheels.type"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from "lucide-react"
import { useState, type ReactNode } from "react"

const DATE_STEP = "date"
const TIME_STEP = "time"

type DateStep = typeof DATE_STEP | typeof TIME_STEP

type FinanceDateFieldProps = {
  label?: string
  value: string
  onChange: (next: string) => void
  error?: string
  optional?: boolean
  disabled?: boolean
  minYear?: number
  maxYear?: number
  /** Fecha mínima elegible (`YYYY-MM-DD`); un valor anterior se ajusta a esta. */
  minDate?: string
  /** Control que comparte la fila del disparador. El panel abierto sigue a ancho completo. */
  aside?: ReactNode
  /** El valor pasa a ser `YYYY-MM-DDTHH:mm` y el panel añade la hora. */
  withTime?: boolean
}

export function formatFinanceDateLabel(value: string, locale: string): string {
  const parsed = parseDate(value)
  if (!parsed) {
    return "Elegir fecha"
  }
  const date = new Date(
    Number(parsed.year),
    Number(parsed.month) - 1,
    Number(parsed.day)
  )
  if (Number.isNaN(date.getTime())) {
    return "Elegir fecha"
  }
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function FinanceDateField({
  label,
  value,
  onChange,
  error,
  optional = false,
  disabled = false,
  minYear,
  maxYear,
  minDate,
  aside,
  withTime = false,
}: FinanceDateFieldProps) {
  const formatLocale = useFormatLocale()
  const dateValue = value.slice(0, 10)
  const timeValue = value.slice(11, 16)
  const hasDate = Boolean(parseDate(dateValue))
  const hasTime = /^\d{2}:\d{2}$/.test(timeValue)
  const hasValue = hasDate && (!withTime || hasTime)
  const [step, setStep] = useState<DateStep>(DATE_STEP)
  const valueLabel = hasValue
    ? withTime
      ? `${formatCalendarDate(value, formatLocale)}, ${formatHm24Display12h(timeValue)}`
      : formatFinanceDateLabel(value, formatLocale)
    : optional
      ? "Sin fecha"
      : "Elegir fecha"

  function changeDate(next: string) {
    const date = minDate && next < minDate ? minDate : next
    if (!withTime) {
      onChange(date)
      return
    }
    onChange(`${date}T${hasTime ? timeValue : "00:00"}`)
  }

  function changeTime(next: string) {
    onChange(`${hasDate ? dateValue : todayDateInput()}T${next}`)
  }

  return (
    <WheelField
      label={label}
      valueLabel={valueLabel}
      icon={CalendarIcon}
      error={error}
      disabled={disabled}
      defaultOpen={!hasValue && !optional}
      aside={aside}
      footer={(close) =>
        withTime ? (
          <div className="mt-3 flex w-full items-center gap-2">
            {step === DATE_STEP ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={PRESSABLE_CLASS}
                  disabled={disabled}
                  onClick={() => {
                    onChange(nowDateTimeInput())
                    setStep(TIME_STEP)
                  }}
                >
                  <CalendarIcon className="size-4 shrink-0" />
                  Hoy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn("ml-auto", PRESSABLE_CLASS)}
                  disabled={disabled}
                  onClick={() => setStep(TIME_STEP)}
                >
                  Continuar
                  <ChevronRightIcon className="size-4 shrink-0" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={PRESSABLE_CLASS}
                  disabled={disabled}
                  onClick={() => setStep(DATE_STEP)}
                >
                  <ChevronLeftIcon className="size-4 shrink-0" />
                  Volver
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn("ml-auto", PRESSABLE_CLASS)}
                  disabled={disabled || !hasValue}
                  onClick={close}
                >
                  <CheckIcon className="size-4 shrink-0" />
                  Listo
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-3 flex w-full items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={PRESSABLE_CLASS}
              disabled={disabled}
              onClick={() => {
                changeDate(todayDateInput())
                close()
              }}
            >
              <CalendarIcon className="size-4 shrink-0" />
              Hoy
            </Button>
            {optional ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={PRESSABLE_CLASS}
                disabled={disabled}
                onClick={() => {
                  onChange("")
                  close()
                }}
              >
                <XIcon className="size-4 shrink-0" />
                Sin fecha
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn("ml-auto", PRESSABLE_CLASS)}
              disabled={disabled || !hasValue}
              onClick={close}
            >
              <CheckIcon className="size-4 shrink-0" />
              Listo
            </Button>
          </div>
        )
      }
    >
      {withTime ? (
        <div
          key={step}
          className={cn(
            "w-full animate-in duration-200 fade-in-0",
            step === DATE_STEP
              ? "slide-in-from-left-2"
              : "slide-in-from-right-2"
          )}
        >
          {step === DATE_STEP ? (
            <DateWheels
              value={hasDate ? dateValue : todayDateInput()}
              onChange={changeDate}
              disabled={disabled}
              minYear={minYear}
              maxYear={maxYear}
            />
          ) : (
            <TimePairWheels
              label="Hora"
              value={hasTime ? timeValue : "00:00"}
              onChange={changeTime}
              disabled={disabled}
            />
          )}
        </div>
      ) : (
        <DateWheels
          value={hasDate ? dateValue : todayDateInput()}
          onChange={changeDate}
          disabled={disabled}
          minYear={minYear}
          maxYear={maxYear}
        />
      )}
    </WheelField>
  )
}
