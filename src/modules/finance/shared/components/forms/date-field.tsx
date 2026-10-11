"use client"

import {
  formatCalendarDate,
  nowDateTimeInput,
  todayDateInput,
} from "@/src/modules/finance/shared/lib/ledger-form"
import { Button } from "@/src/shared/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  DateWheels,
  TimePairWheels,
} from "@/src/shared/components/ui/wheel-picker"
import { formatHm24Display12h, parseDate } from "@/src/shared/types/wheels.type"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
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
  /** Control que comparte la fila del disparador. El panel abierto sigue a ancho completo. */
  aside?: ReactNode
  /** El valor pasa a ser `YYYY-MM-DDTHH:mm` y el panel añade la hora. */
  withTime?: boolean
}

export function formatFinanceDateLabel(value: string): string {
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
  return date.toLocaleDateString("es", {
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
  aside,
  withTime = false,
}: FinanceDateFieldProps) {
  const dateValue = value.slice(0, 10)
  const timeValue = value.slice(11, 16)
  const hasDate = Boolean(parseDate(dateValue))
  const hasTime = /^\d{2}:\d{2}$/.test(timeValue)
  const hasValue = hasDate && (!withTime || hasTime)
  const [open, setOpen] = useState(!hasValue && !optional)
  const [step, setStep] = useState<DateStep>(DATE_STEP)

  function changeDate(next: string) {
    if (!withTime) {
      onChange(next)
      return
    }
    onChange(`${next}T${hasTime ? timeValue : "00:00"}`)
  }

  function changeTime(next: string) {
    onChange(`${hasDate ? dateValue : todayDateInput()}T${next}`)
  }

  return (
    <Field data-invalid={error ? true : undefined} className="gap-1">
      {label ? (
        <FieldLabel className="text-sm text-muted-foreground">
          {label}
        </FieldLabel>
      ) : null}
      <Collapsible
        className="w-full"
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <div className="flex w-full items-center gap-2">
          <CollapsibleTrigger
            disabled={disabled}
            className={cn(
              "flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-card px-3 text-left",
              PRESSABLE_CLASS,
              disabled && "opacity-50"
            )}
          >
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 text-sm font-medium">
              {hasValue
                ? withTime
                  ? `${formatCalendarDate(value)}, ${formatHm24Display12h(timeValue)}`
                  : formatFinanceDateLabel(value)
                : optional
                  ? "Sin fecha"
                  : "Elegir fecha"}
            </span>
            <ChevronDownIcon
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          {aside ? <div className="w-auto shrink-0">{aside}</div> : null}
        </div>
        <CollapsibleContent className="w-full pt-3">
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

          {withTime ? (
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
                    onClick={() => setOpen(false)}
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
                  setOpen(false)
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
                    setOpen(false)
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
                onClick={() => setOpen(false)}
              >
                <CheckIcon className="size-4 shrink-0" />
                Listo
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
