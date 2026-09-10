"use client"

import {
  DEFAULT_REMINDER,
  WEEKDAY_LABELS,
  formatReminderTime,
  getReminderSnapshot,
  isReminderDue,
  markReminderFired,
  subscribeReminder,
  writeReminder,
  type KeepAwakeReminder,
} from "@/src/modules/keep-awake/lib/reminders"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Switch } from "@/src/shared/components/ui/switch"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { PRESSABLE_CLASS, cn } from "@/src/shared/lib/utils"
import { Bell } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"

function notifyReminder() {
  if (typeof Notification === "undefined") return
  if (Notification.permission !== "granted") return
  try {
    new Notification("Keep Awake", {
      body: "Toca para mantener la pantalla despierta.",
    })
  } catch {
    /* permission or environment */
  }
}

export function KeepAwakeReminderCard({
  onConfirm,
}: {
  onConfirm: () => void
}) {
  const reminder = useSyncExternalStore(
    subscribeReminder,
    getReminderSnapshot,
    () => DEFAULT_REMINDER
  )
  const [promptOpen, setPromptOpen] = useState(false)

  useEffect(() => {
    function check() {
      const current = getReminderSnapshot()
      const now = new Date()
      if (!isReminderDue(current, now)) return
      writeReminder(markReminderFired(current, now))
      setPromptOpen(true)
      notifyReminder()
    }

    const timeout = window.setTimeout(check, 0)
    const id = window.setInterval(check, 15_000)
    const onVisible = () => {
      if (document.visibilityState === "visible") check()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(id)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  function update(next: KeepAwakeReminder) {
    writeReminder(next)
  }

  async function enable(checked: boolean) {
    if (checked && typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        await Notification.requestPermission()
      } catch {
        /* ignore */
      }
    }
    update({ ...reminder, enabled: checked })
  }

  function toggleDay(day: number) {
    const days = reminder.days.includes(day)
      ? reminder.days.filter((item) => item !== day)
      : [...reminder.days, day].sort((a, b) => a - b)
    update({ ...reminder, days })
  }

  const timeValue = formatReminderTime(reminder)

  return (
    <>
      {promptOpen ? (
        <Alert>
          <Bell />
          <AlertTitle>Recordatorio de Keep Awake</AlertTitle>
          <AlertDescription>
            Es la hora que configuraste. Confirma para pedir el bloqueo de
            pantalla; no se activa solo en segundo plano.
          </AlertDescription>
          <AlertAction className="flex gap-1">
            <Button
              type="button"
              size="sm"
              className={PRESSABLE_CLASS}
              onClick={() => {
                setPromptOpen(false)
                onConfirm()
              }}
            >
              Activar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={PRESSABLE_CLASS}
              onClick={() => setPromptOpen(false)}
            >
              Ahora no
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      <SummarySection title="Recordatorio" icon={Bell}>
        <div className="flex flex-col gap-3 px-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">Avisarme a una hora</p>
              <p className="text-xs text-muted-foreground">
                Recibirás un aviso para confirmar. El bloqueo no arranca solo.
              </p>
            </div>
            <Switch
              checked={reminder.enabled}
              onCheckedChange={(checked) => void enable(checked)}
              aria-label="Activar recordatorio"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0">Hora</span>
            <Input
              type="time"
              value={timeValue}
              disabled={!reminder.enabled}
              aria-label="Hora del recordatorio"
              className="max-w-36"
              onChange={(event) => {
                const [hourText, minuteText] = event.target.value.split(":")
                update({
                  ...reminder,
                  hour: Number(hourText) || 0,
                  minute: Number(minuteText) || 0,
                })
              }}
            />
          </label>

          <div className="flex flex-wrap gap-1" role="group" aria-label="Días">
            {WEEKDAY_LABELS.map((label, day) => {
              const selected = reminder.days.length === 0 || reminder.days.includes(day)
              const pressed = reminder.days.includes(day)
              return (
                <Button
                  key={label}
                  type="button"
                  size="sm"
                  variant={pressed || reminder.days.length === 0 ? "outline" : "ghost"}
                  disabled={!reminder.enabled}
                  aria-pressed={pressed}
                  className={cn(
                    PRESSABLE_CLASS,
                    "min-w-8",
                    selected && reminder.days.length > 0 && "bg-muted"
                  )}
                  onClick={() => toggleDay(day)}
                >
                  {label}
                </Button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Sin días marcados, el aviso se ofrece todos los días a esa hora.
          </p>
        </div>
      </SummarySection>
    </>
  )
}
