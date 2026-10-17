"use client"

import {
  EMAIL_SYNC_SCHEDULE_MODES,
  MAX_EMAIL_SYNC_TIMES,
  MIN_EMAIL_SYNC_INTERVAL_MINUTES,
  formatSyncIntervalLabel,
  nextEmailSyncTime,
  parseSyncIntervalMinutes,
  type FinanceModuleFormValues,
} from "./lib/finance-module-form"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { WheelField } from "@/src/shared/components/ui/wheel-field"
import {
  DurationWheels,
  TimePairWheels,
} from "@/src/shared/components/ui/wheel-picker"
import { formatTimeForDisplay } from "@/src/shared/lib/date-format"
import {
  durationMinutesToHm,
  hmToDurationMinutes,
} from "@/src/shared/types/wheels.type"
import { Clock, PlusIcon, Timer, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { Controller, useWatch, type Control } from "react-hook-form"

type EmailSyncTimesFieldProps = {
  times: string[]
  onChange: (times: string[]) => void
  error?: string
  disabled?: boolean
}

export function EmailSyncTimesField({
  times,
  onChange,
  error,
  disabled = false,
}: EmailSyncTimesFieldProps) {
  const [openedOnAdd, setOpenedOnAdd] = useState<number | null>(null)

  return (
    <Field
      data-invalid={error ? true : undefined}
      className="flex flex-col gap-3"
    >
      <FieldLabel className="text-sm text-muted-foreground">
        Horas del día
      </FieldLabel>
      {times.map((time, index) => (
        <WheelField
          key={index}
          valueLabel={formatTimeForDisplay(time)}
          icon={Clock}
          disabled={disabled}
          defaultOpen={openedOnAdd === index}
          aside={
            times.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Quitar hora ${index + 1}`}
                disabled={disabled}
                onClick={() => {
                  onChange(times.filter((_, itemIndex) => itemIndex !== index))
                  setOpenedOnAdd(null)
                }}
              >
                <Trash2Icon />
              </Button>
            ) : null
          }
        >
          <TimePairWheels
            value={time}
            onChange={(next) => {
              const nextTimes = [...times]
              nextTimes[index] = next
              onChange(nextTimes)
            }}
            disabled={disabled}
          />
        </WheelField>
      ))}
      {times.length < MAX_EMAIL_SYNC_TIMES ? (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => {
            const nextTimes = [...times, nextEmailSyncTime(times)]
            onChange(nextTimes)
            setOpenedOnAdd(nextTimes.length - 1)
          }}
        >
          <PlusIcon data-icon="inline-start" />
          Agregar hora
        </Button>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}

type EmailSyncIntervalFieldProps = {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function EmailSyncIntervalField({
  value,
  onChange,
  error,
  disabled = false,
}: EmailSyncIntervalFieldProps) {
  const minutes = parseSyncIntervalMinutes(value)

  return (
    <WheelField
      label="Tiempo entre revisiones"
      valueLabel={formatSyncIntervalLabel(minutes)}
      icon={Timer}
      error={error}
      disabled={disabled}
    >
      <DurationWheels
        value={durationMinutesToHm(minutes)}
        minuteStep={5}
        disabled={disabled}
        onChange={(next) => {
          const nextMinutes = Math.max(
            MIN_EMAIL_SYNC_INTERVAL_MINUTES,
            hmToDurationMinutes(next)
          )
          onChange(String(nextMinutes))
        }}
      />
    </WheelField>
  )
}

type EmailSyncScheduleFieldsProps = {
  control: Control<FinanceModuleFormValues>
  disabled?: boolean
}

/** Editor del horario de sync (intervalo u horas fijas) según el modo elegido. */
export function EmailSyncScheduleFields({
  control,
  disabled = false,
}: EmailSyncScheduleFieldsProps) {
  const scheduleMode = useWatch({ control, name: "emailSyncScheduleMode" })

  if (scheduleMode === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL) {
    return (
      <Controller
        control={control}
        name="emailSyncEveryMinutes"
        render={({ field, fieldState }) => (
          <EmailSyncIntervalField
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            disabled={disabled}
          />
        )}
      />
    )
  }

  return (
    <Controller
      control={control}
      name="emailSyncTimes"
      render={({ field, fieldState }) => (
        <EmailSyncTimesField
          times={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
          disabled={disabled}
        />
      )}
    />
  )
}
