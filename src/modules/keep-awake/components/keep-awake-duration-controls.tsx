"use client"

import {
  COUNTDOWN_PRESETS_MINUTES,
  type TimerMode,
} from "@/src/modules/keep-awake/lib/prefs"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldGroup, FieldTitle } from "@/src/shared/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/src/shared/components/ui/popover"
import { Separator } from "@/src/shared/components/ui/separator"
import { WheelField } from "@/src/shared/components/ui/wheel-field"
import { DurationWheels } from "@/src/shared/components/ui/wheel-picker"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  durationMinutesToHm,
  hmToDurationMinutes,
} from "@/src/shared/types/wheels.type"
import { CheckIcon, ChevronDown, Timer, XIcon } from "lucide-react"
import { useState } from "react"

function formatDurationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const leftover = minutes % 60
  if (hours === 0) {
    return `${leftover} min`
  }
  if (leftover === 0) {
    return `${hours} h`
  }
  return `${hours} h ${leftover} min`
}

type KeepAwakeDurationControlsProps = {
  timerMode: TimerMode
  durationMinutes: number
  canEditMode: boolean
  onChange: (next: { timerMode: TimerMode; durationMinutes: number }) => void
}

function formatTimerLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const leftover = minutes % 60
  if (leftover === 0) {
    return `${hours} h`
  }
  return `${hours} h ${leftover} min`
}

export function KeepAwakeDurationControls({
  timerMode,
  durationMinutes,
  canEditMode,
  onChange,
}: KeepAwakeDurationControlsProps) {
  const [open, setOpen] = useState(false)
  const [draftMinutes, setDraftMinutes] = useState(durationMinutes)
  const countdown = timerMode === "countdown"
  const triggerLabel = countdown
    ? formatTimerLabel(durationMinutes)
    : "Temporizador"

  function syncDraftFromPrefs() {
    setDraftMinutes(durationMinutes)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && !canEditMode) {
      return
    }
    if (nextOpen) {
      syncDraftFromPrefs()
    }
    setOpen(nextOpen)
  }

  function applyDraft(minutes: number) {
    setDraftMinutes(minutes)
  }

  function handleAccept() {
    onChange({ timerMode: "countdown", durationMinutes: draftMinutes })
    setOpen(false)
  }

  function handleCancel() {
    syncDraftFromPrefs()
    setOpen(false)
  }

  function handleClear() {
    onChange({ timerMode: "open", durationMinutes })
    setOpen(false)
  }

  return (
    <div className="flex justify-center">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          disabled={!canEditMode}
          render={
            <Button
              type="button"
              variant={countdown ? "default" : "outline"}
              disabled={!canEditMode}
              aria-haspopup="dialog"
              className={cn("h-8 rounded-2xl px-4", PRESSABLE_CLASS)}
            />
          }
        >
          <Timer data-icon="inline-start" aria-hidden />
          {triggerLabel}
          <ChevronDown data-icon="inline-end" aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          align="center"
          side="bottom"
          className="w-[min(22rem,calc(100vw-2rem))]"
        >
          <PopoverHeader>
            <PopoverTitle>Temporizador</PopoverTitle>
            <PopoverDescription>
              Elige un atajo en minutos o una duración en horas y minutos.
            </PopoverDescription>
          </PopoverHeader>

          <FieldGroup className="gap-3">
            <Field>
              <FieldTitle>Minutos</FieldTitle>
              <div
                className="flex flex-wrap justify-center gap-2"
                role="group"
                aria-label="Duración en minutos"
              >
                {COUNTDOWN_PRESETS_MINUTES.map((minutes) => (
                  <Button
                    key={minutes}
                    type="button"
                    size="sm"
                    variant={draftMinutes === minutes ? "default" : "outline"}
                    className={cn(PRESSABLE_CLASS, "min-w-14 rounded-full")}
                    aria-pressed={draftMinutes === minutes}
                    onClick={() => applyDraft(minutes)}
                  >
                    {minutes} min
                  </Button>
                ))}
              </div>
            </Field>

            <Separator />

            <WheelField
              label="Horas y minutos"
              valueLabel={formatDurationLabel(draftMinutes)}
              icon={Timer}
            >
              <DurationWheels
                value={durationMinutesToHm(draftMinutes)}
                minuteStep={1}
                onChange={(next) => applyDraft(hmToDurationMinutes(next))}
              />
            </WheelField>
          </FieldGroup>

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={PRESSABLE_CLASS}
              onClick={handleClear}
            >
              <XIcon className="size-4 shrink-0" />
              Limpiar
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={PRESSABLE_CLASS}
                onClick={handleCancel}
              >
                <XIcon className="size-4 shrink-0" />
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                className={PRESSABLE_CLASS}
                onClick={handleAccept}
              >
                <CheckIcon className="size-4 shrink-0" />
                Aceptar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
