"use client"

import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { formatElapsed } from "@/src/modules/keep-awake/lib/format-elapsed"
import { appToast } from "@/src/shared/lib/app-toast"
import { formatClockTimeFromDate } from "@/src/shared/lib/date-format"
import {
  getHistorySnapshot,
  getServerHistorySnapshot,
  historyEndReasonLabel,
  subscribeHistory,
  type KeepAwakeHistoryEntry,
  type SessionEndReason,
} from "@/src/modules/keep-awake/lib/session-history"
import {
  ClockIcon,
  Copy,
  MonitorOff,
  PanelsTopLeft,
  Pause,
  Square,
  Timer,
  XIcon,
} from "lucide-react"
import { useSyncExternalStore } from "react"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"

type KeepAwakeHistorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatRange(entry: KeepAwakeHistoryEntry, locale: string): string {
  const start = formatClockTimeFromDate(new Date(entry.startedAt), locale)
  const end = formatClockTimeFromDate(new Date(entry.endedAt), locale)
  return `${start} – ${end}`
}

function historyReasonIcon(reason: SessionEndReason) {
  switch (reason) {
    case "countdown_finished":
      return Timer
    case "tab_yielded":
      return PanelsTopLeft
    case "layout_unmounted":
      return MonitorOff
    case "ended":
      return Square
    default:
      return Pause
  }
}

function historyReasonColor(reason: SessionEndReason) {
  switch (reason) {
    case "countdown_finished":
      return "#22C55E"
    case "tab_yielded":
      return "#3B82F6"
    case "layout_unmounted":
      return "#64748B"
    case "ended":
      return "#EF4444"
    default:
      return "#F59E0B"
  }
}

export function KeepAwakeHistorySheet({
  open,
  onOpenChange,
}: KeepAwakeHistorySheetProps) {
  const locale = useFormatLocale()
  const entries = useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    getServerHistorySnapshot
  )
  const visible = entries.slice(0, 8)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Historial"
          description="Sesiones cerradas recientes."
        />
        <SheetBody>
          {visible.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                <ClockIcon
                  className="size-5 text-muted-foreground"
                  aria-hidden
                />
              </span>
              <p className="text-sm font-medium">Sin sesiones recientes</p>
              <p className="text-xs text-muted-foreground">
                Las sesiones cerradas aparecerán aquí.
              </p>
            </div>
          )}

          <div className="flex flex-col">
            {visible.map((entry, index) => {
              const Icon = historyReasonIcon(entry.endReason)
              const color = historyReasonColor(entry.endReason)
              return (
                <Item
                  key={entry.id}
                  variant="plain"
                  className={cn(
                    index !== visible.length - 1 && "border-b border-border/60"
                  )}
                >
                  <ItemMedia
                    className="h-10 w-max min-w-10 rounded-full px-1"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
                    }}
                  >
                    <Icon className="size-5" style={{ color }} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      {formatElapsed(entry.durationSeconds)}
                    </ItemTitle>
                    <ItemDescription className="truncate text-xs">
                      {`${formatRange(entry, locale)} · ${historyEndReasonLabel(entry.endReason)}`}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className={PRESSABLE_CLASS}
                      aria-label={`Copiar ${formatElapsed(entry.durationSeconds)}`}
                      onClick={() => {
                        const text = formatElapsed(entry.durationSeconds)
                        void navigator.clipboard.writeText(text).then(
                          () =>
                            appToast.success({
                              text1: "Duración copiada",
                              text2: text,
                            }),
                          () =>
                            appToast.error({
                              text1: "No se pudo copiar",
                              text2: text,
                            })
                        )
                      }}
                    >
                      <Copy className="size-4" aria-hidden />
                    </Button>
                  </ItemActions>
                </Item>
              )
            })}
          </div>
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
