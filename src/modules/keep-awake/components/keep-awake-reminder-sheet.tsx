"use client"

import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { useSyncExternalStore } from "react"
import {
  DEFAULT_REMINDER,
  subscribeReminder,
  WEEKDAY_LABELS,
  formatReminderTime,
  getReminderSnapshot,
  reminderTimeFromDate,
  toggleReminderDay,
  writeReminder,
  type KeepAwakeReminder,
} from "@/src/modules/keep-awake/lib/reminders"
import { Button } from "@/src/shared/components/ui/button"
import { TimePairWheels } from "@/src/shared/components/ui/wheel-picker"
import { PRESSABLE_CLASS, cn } from "@/src/shared/lib/utils"
import { type FormEvent, useState } from "react"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { ClockIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react"

type KeepAwakeReminderSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WEEKDAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const

const REMINDER_FORM_ID = "keep-awake-reminder-form"

function isPristineClock(reminder: KeepAwakeReminder) {
  return (
    reminder.hour === DEFAULT_REMINDER.hour &&
    reminder.minute === DEFAULT_REMINDER.minute &&
    reminder.lastFiredKey === null
  )
}

function createDraft(stored: KeepAwakeReminder): KeepAwakeReminder {
  if (!stored.enabled && isPristineClock(stored)) {
    const soon = new Date()
    soon.setMinutes(soon.getMinutes() + 1)
    return { ...stored, ...reminderTimeFromDate(soon) }
  }
  return { ...stored }
}

function sameSchedule(left: KeepAwakeReminder, right: KeepAwakeReminder) {
  return (
    left.hour === right.hour &&
    left.minute === right.minute &&
    left.days.length === right.days.length &&
    left.days.every((day, index) => day === right.days[index])
  )
}

export function KeepAwakeReminderSheet({
  open,
  onOpenChange,
}: KeepAwakeReminderSheetProps) {
  const reminder = useSyncExternalStore(
    subscribeReminder,
    getReminderSnapshot,
    () => DEFAULT_REMINDER
  )

  function disable() {
    writeReminder({ ...getReminderSnapshot(), enabled: false })
    onOpenChange(false)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Recordatorio"
      actions={{
        delete: reminder.enabled ? (
          <Button
            type="button"
            variant="secondary"
            className={cn(PRESSABLE_CLASS, "flex-1")}
            onClick={disable}
          >
            <Trash2Icon className="size-4 shrink-0" />
            Quitar
          </Button>
        ) : undefined,
        close: (
          <Button
            type="button"
            variant="outline"
            className={cn(PRESSABLE_CLASS, "flex-1")}
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cerrar
          </Button>
        ),
        submit: (
          <Button
            type="submit"
            form={REMINDER_FORM_ID}
            className={cn(PRESSABLE_CLASS, "flex-1")}
          >
            <SaveIcon className="size-4 shrink-0" />
            Guardar
          </Button>
        ),
      }}
    >
      {open ? (
        <KeepAwakeReminderForm onSaved={() => onOpenChange(false)} />
      ) : null}
    </BottomSheet>
  )
}

export function KeepAwakeReminderForm({ onSaved }: { onSaved: () => void }) {
  const stored = getReminderSnapshot()
  const [draft, setDraft] = useState(() => createDraft(stored))
  const today = new Date().getDay()
  const everyDay = draft.days.length === 0 || draft.days.length === 7

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      try {
        await Notification.requestPermission()
      } catch {
        /* ignore */
      }
    }
    writeReminder({
      ...draft,
      enabled: true,
      lastFiredKey: sameSchedule(draft, stored) ? stored.lastFiredKey : null,
    })
    onSaved()
  }

  return (
    <form
      id={REMINDER_FORM_ID}
      className="flex flex-col gap-4"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <SummarySection title="Hora exacta" icon={ClockIcon}>
        <TimePairWheels
          value={formatReminderTime(draft)}
          minuteStep={1}
          onChange={(next) => {
            const [hourText, minuteText] = next.split(":")
            setDraft({
              ...draft,
              hour: Number(hourText) || 0,
              minute: Number(minuteText) || 0,
            })
          }}
        />
      </SummarySection>

      <div
        className="grid grid-cols-7 items-center gap-1.5"
        role="group"
        aria-label="Días"
      >
        {WEEKDAY_LABELS.map((label, day) => {
          const pressed = draft.days.includes(day)
          const selected = everyDay || pressed
          const isToday = day === today
          return (
            <div key={label} className="flex items-center justify-center">
              <Button
                type="button"
                size="icon"
                variant={selected ? "default" : "outline"}
                aria-pressed={everyDay ? true : pressed}
                aria-current={isToday ? "date" : undefined}
                aria-label={
                  isToday ? `${WEEKDAY_NAMES[day]}, hoy` : WEEKDAY_NAMES[day]
                }
                className={cn(
                  PRESSABLE_CLASS,
                  "size-10 rounded-full",
                  isToday &&
                    "ring-2 ring-ring ring-offset-2 ring-offset-background"
                )}
                onClick={() =>
                  setDraft({
                    ...draft,
                    days: toggleReminderDay(draft.days, day),
                  })
                }
              >
                {label}
              </Button>
            </div>
          )
        })}
      </div>

      <Button
        type="button"
        size="sm"
        variant={everyDay ? "secondary" : "ghost"}
        className={cn(PRESSABLE_CLASS, "self-end")}
        aria-pressed={everyDay}
        onClick={() => setDraft({ ...draft, days: [] })}
      >
        Todos los días
      </Button>
    </form>
  )
}

export { REMINDER_FORM_ID }
