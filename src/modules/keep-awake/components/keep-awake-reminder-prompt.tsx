"use client"

import {
  formatReminderTimeLabel,
  getReminderSnapshot,
  isReminderDue,
  markReminderFired,
  nextReminderDelayMs,
  subscribeReminder,
  writeReminder,
} from "@/src/modules/keep-awake/lib/reminders"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import {
  FLOATING_SHEET_CONTENT_CLASS,
  SHEET_FOOTER_CLASS,
} from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { PRESSABLE_CLASS, cn } from "@/src/shared/lib/utils"
import { Bell, CheckIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"

function notifyReminder() {
  if (typeof Notification === "undefined") {
    return
  }
  if (Notification.permission !== "granted") {
    return
  }
  try {
    new Notification("Llegó la hora", {
      body: "Keep Awake",
    })
  } catch {
    /* permission or environment */
  }
}

export function KeepAwakeReminderPrompt({
  onConfirm,
}: {
  onConfirm: () => void
}) {
  const locale = useFormatLocale()
  // Se abre por un evento, no por un toque: al dispararse escribe su clave en
  // la URL, así Atrás lo cierra y recargar no lo pierde a medias.
  const { open: promptOpen, setOpen: setPromptOpen } = useSheetParam(
    "keep-awake-reminder-prompt"
  )
  const [dueLabel, setDueLabel] = useState("")

  useEffect(() => {
    let timeoutId = 0
    let cancelled = false

    function fire() {
      const current = getReminderSnapshot()
      const now = new Date()
      if (!isReminderDue(current, now)) {
        return
      }
      writeReminder(markReminderFired(current, now))
      setDueLabel(formatReminderTimeLabel(current, locale))
      setPromptOpen(true)
      notifyReminder()
    }

    function arm() {
      window.clearTimeout(timeoutId)
      if (cancelled) {
        return
      }
      const current = getReminderSnapshot()
      const now = new Date()
      if (isReminderDue(current, now)) {
        fire()
        return
      }
      if (!current.enabled) {
        return
      }
      timeoutId = window.setTimeout(
        () => {
          fire()
          if (!cancelled) {
            arm()
          }
        },
        nextReminderDelayMs(current, now)
      )
    }

    arm()
    const unsub = subscribeReminder(arm)
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        arm()
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      unsub()
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [locale, setPromptOpen])

  return (
    <Drawer
      open={promptOpen}
      swipeDirection="down"
      onOpenChange={(next) => setPromptOpen(next)}
    >
      <DrawerContent className={FLOATING_SHEET_CONTENT_CLASS}>
        <SheetHeader title="Llegó la hora" />
        <SheetBody>
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground motion-safe:animate-pulse [&_svg]:size-7">
              <Bell aria-hidden />
            </span>
            <p className="font-heading text-5xl font-bold tracking-tight tabular-nums">
              {dueLabel}
            </p>
          </div>
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="ghost"
            className={cn(PRESSABLE_CLASS, "flex-1")}
            onClick={() => setPromptOpen(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Ahora no
          </Button>
          <Button
            type="button"
            className={cn(PRESSABLE_CLASS, "flex-1")}
            onClick={() => {
              setPromptOpen(false)
              onConfirm()
            }}
          >
            <CheckIcon className="size-4 shrink-0" />
            Activar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
