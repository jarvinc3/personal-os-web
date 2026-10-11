"use client"

import { Button } from "@/src/shared/components/ui/button"
import { PRESSABLE_CLASS, cn } from "@/src/shared/lib/utils"
import { AlertCircleIcon, Bell, HelpCircleIcon, History } from "lucide-react"

type KeepAwakePanelToolbarProps = {
  reminderOpen: boolean
  reminderActive: boolean
  reminderTime: string
  historyOpen: boolean
  helpOpen: boolean
  alertOpen: boolean
  showPipAlert: boolean
  onReminderOpen: () => void
  onHistoryOpen: () => void
  onHelpOpen: () => void
  onAlertOpen: () => void
}

export function KeepAwakePanelToolbar({
  reminderOpen,
  reminderActive,
  reminderTime,
  historyOpen,
  helpOpen,
  alertOpen,
  showPipAlert,
  onReminderOpen,
  onHistoryOpen,
  onHelpOpen,
  onAlertOpen,
}: KeepAwakePanelToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-1">
      <div className="flex items-center gap-1">
        <Button
          variant={reminderActive ? "secondary" : "ghost"}
          size="icon-lg"
          className={cn(PRESSABLE_CLASS, "relative")}
          aria-label={
            reminderActive ? `Recordatorio ${reminderTime}` : "Recordatorio"
          }
          aria-haspopup="dialog"
          aria-expanded={reminderOpen}
          onClick={onReminderOpen}
        >
          <Bell aria-hidden />
          {reminderActive ? (
            <span
              className="absolute top-2.5 right-2.5 size-2 rounded-full bg-primary"
              aria-hidden
            />
          ) : null}
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          className={PRESSABLE_CLASS}
          aria-label="Historial"
          aria-haspopup="dialog"
          aria-expanded={historyOpen}
          onClick={onHistoryOpen}
        >
          <History aria-hidden />
        </Button>
      </div>
      <div className="flex items-center gap-1">
        {showPipAlert ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className={PRESSABLE_CLASS}
            aria-label="Miniplayer no disponible"
            aria-haspopup="dialog"
            aria-expanded={alertOpen}
            onClick={onAlertOpen}
          >
            <AlertCircleIcon aria-hidden />
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          className={PRESSABLE_CLASS}
          aria-label="Ayuda"
          aria-haspopup="dialog"
          aria-expanded={helpOpen}
          onClick={onHelpOpen}
        >
          <HelpCircleIcon aria-hidden />
        </Button>
      </div>
    </div>
  )
}
