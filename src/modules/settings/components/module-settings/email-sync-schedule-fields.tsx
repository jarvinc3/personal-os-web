"use client"

import {
  EMAIL_SYNC_SCHEDULE_MODES,
  MAX_EMAIL_SYNC_TIMES,
  MIN_EMAIL_SYNC_INTERVAL_MINUTES,
  formatSyncIntervalLabel,
  nextEmailSyncTime,
  parseSyncIntervalMinutes,
  type FinanceModuleFormValues,
} from "@/src/modules/settings/lib/finance-module-form"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  DurationWheels,
  TimePairWheels,
} from "@/src/shared/components/ui/wheel-picker"
import { cn } from "@/src/shared/lib/utils"
import { formatTimeForDisplay } from "@/src/shared/lib/date-format"
import {
  durationMinutesToHm,
  hmToDurationMinutes,
} from "@/src/shared/types/wheels.type"
import {
  CheckIcon,
  Clock,
  PencilIcon,
  PlusIcon,
  Timer,
  Trash2Icon,
} from "lucide-react"
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  return (
    <Field
      data-invalid={error ? true : undefined}
      className="flex flex-col gap-3"
    >
      <FieldLabel className="text-sm text-muted-foreground">
        Horas del día
      </FieldLabel>
      {times.map((time, index) => {
        const isEditing = editingIndex === index
        return (
          <div
            key={index}
            className={cn(
              "flex flex-col rounded-xl border bg-card p-2",
              isEditing ? "border-primary" : "border-border"
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 text-sm font-medium tabular-nums">
                {formatTimeForDisplay(time)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={
                  isEditing
                    ? `Cerrar hora ${index + 1}`
                    : `Editar hora ${index + 1}`
                }
                aria-pressed={isEditing}
                disabled={disabled}
                onClick={() => setEditingIndex(isEditing ? null : index)}
              >
                {isEditing ? <CheckIcon /> : <PencilIcon />}
              </Button>
              {times.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Quitar hora ${index + 1}`}
                  disabled={disabled}
                  onClick={() => {
                    onChange(
                      times.filter((_, itemIndex) => itemIndex !== index)
                    )
                    setEditingIndex((current) => {
                      if (current === null) {
                        return null
                      }
                      if (current === index) {
                        return null
                      }
                      if (current > index) {
                        return current - 1
                      }
                      return current
                    })
                  }}
                >
                  <Trash2Icon />
                </Button>
              ) : null}
            </div>
            {isEditing ? (
              <div className="pt-2">
                <TimePairWheels
                  value={time}
                  onChange={(next) => {
                    const nextTimes = [...times]
                    nextTimes[index] = next
                    onChange(nextTimes)
                  }}
                  disabled={disabled}
                />
              </div>
            ) : null}
          </div>
        )
      })}
      {times.length < MAX_EMAIL_SYNC_TIMES ? (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => {
            const nextTimes = [...times, nextEmailSyncTime(times)]
            onChange(nextTimes)
            setEditingIndex(nextTimes.length - 1)
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
  const [editing, setEditing] = useState(false)
  const minutes = parseSyncIntervalMinutes(value)

  return (
    <Field
      data-invalid={error ? true : undefined}
      className="flex flex-col gap-3"
    >
      <FieldLabel className="text-sm text-muted-foreground">
        Tiempo entre revisiones
      </FieldLabel>
      <div
        className={cn(
          "flex flex-col rounded-xl border bg-card p-2",
          editing ? "border-primary" : "border-border"
        )}
      >
        <div className="flex items-center gap-2">
          <Timer className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 text-sm font-medium tabular-nums">
            {formatSyncIntervalLabel(minutes)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={editing ? "Cerrar intervalo" : "Editar intervalo"}
            aria-pressed={editing}
            disabled={disabled}
            onClick={() => setEditing((current) => !current)}
          >
            {editing ? <CheckIcon /> : <PencilIcon />}
          </Button>
        </div>
        {editing ? (
          <div className="pt-2">
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
          </div>
        ) : null}
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
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
