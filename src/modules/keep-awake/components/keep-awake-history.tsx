"use client"

import { formatElapsed } from "@/src/modules/keep-awake/lib/format-elapsed"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  getHistorySnapshot,
  getServerHistorySnapshot,
  historyEndReasonLabel,
  subscribeHistory,
  type KeepAwakeHistoryEntry,
} from "@/src/modules/keep-awake/lib/session-history"
import { Button } from "@/src/shared/components/ui/button"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { Copy, History } from "lucide-react"
import { useSyncExternalStore } from "react"

function formatRange(entry: KeepAwakeHistoryEntry): string {
  const start = new Date(entry.startedAt).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  })
  const end = new Date(entry.endedAt).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  })
  return `${start} – ${end}`
}

export function KeepAwakeHistory() {
  const entries = useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    getServerHistorySnapshot
  )

  if (entries.length === 0) return null

  return (
    <SummarySection title="Recientes" icon={History}>
      {entries.slice(0, 8).map((entry, index) => (
        <div
          key={entry.id}
          className={cn(
            "flex items-center gap-3 py-3",
            index !== Math.min(entries.length, 8) - 1 && "border-b border-border/60"
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium tabular-nums">
              {formatElapsed(entry.durationSeconds)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRange(entry)} · {historyEndReasonLabel(entry.endReason)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={PRESSABLE_CLASS}
            aria-label={`Copiar ${formatElapsed(entry.durationSeconds)}`}
            onClick={() => {
              const text = formatElapsed(entry.durationSeconds)
              void navigator.clipboard.writeText(text).then(
                () => appToast.success({ text1: "Duración copiada", text2: text }),
                () => appToast.error({ text1: "No se pudo copiar", text2: text })
              )
            }}
          >
            <Copy className="size-4" aria-hidden />
          </Button>
        </div>
      ))}
    </SummarySection>
  )
}
