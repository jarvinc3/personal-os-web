"use client"

import { KeepAwakeHistorySheet } from "@/src/modules/keep-awake/components/keep-awake-history-sheet"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { History, MonitorOff } from "lucide-react"
import { useState } from "react"

export function KeepAwakeUnsupported() {
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MonitorOff />
          </EmptyMedia>
          <EmptyTitle>Wake Lock no está disponible</EmptyTitle>
          <EmptyDescription>
            Este navegador no admite la API necesaria para mantener la pantalla
            despierta. Prueba un navegador reciente basado en Chromium, o
            Safari/Firefox actualizados.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            type="button"
            variant="outline"
            className={PRESSABLE_CLASS}
            aria-haspopup="dialog"
            aria-expanded={historyOpen}
            onClick={() => setHistoryOpen(true)}
          >
            <History data-icon="inline-start" />
            Historial
          </Button>
        </EmptyContent>
      </Empty>
      <KeepAwakeHistorySheet open={historyOpen} onOpenChange={setHistoryOpen} />
    </>
  )
}
