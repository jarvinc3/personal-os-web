"use client"

import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { WheelField } from "@/src/shared/components/forms/wheel-field"
import { TimePairWheels } from "@/src/shared/components/forms/wheel-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  formatTimeForDisplay,
  normalizeTimeToApi,
} from "@/src/shared/lib/date-format"
import { ClockFadingIcon, ClockIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

function normalizeTimeForInput(apiTime: string) {
  return normalizeTimeToApi(apiTime) ?? apiTime
}

export function EditQuietHoursSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const { preferences, updatePreferences, updateProfileMutation } = useProfile()
  const quietHours = preferences.notifications.quietHours
  const router = useRouter()
  const [start, setStart] = useState(() =>
    normalizeTimeForInput(quietHours.start)
  )
  const [end, setEnd] = useState(() => normalizeTimeForInput(quietHours.end))

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setStart(normalizeTimeForInput(quietHours.start))
      setEnd(normalizeTimeForInput(quietHours.end))
    }
    onOpenChange(nextOpen)
  }

  const resolvedStart = normalizeTimeToApi(start) ?? start
  const resolvedEnd = normalizeTimeToApi(end) ?? end
  const isDirty =
    resolvedStart !== quietHours.start || resolvedEnd !== quietHours.end

  const handleSave = async () => {
    const nextStart = normalizeTimeToApi(start)
    const nextEnd = normalizeTimeToApi(end)
    if (!nextStart || !nextEnd) {
      appToast.error({
        text1: "Horario no válido",
        text2: "Selecciona una hora de inicio y fin válidas.",
      })
      return
    }

    await updatePreferences({
      notifications: {
        ...preferences.notifications,
        quietHours: { ...quietHours, start: nextStart, end: nextEnd },
      },
    })
    appToast.success({
      text1: "Horario silencioso guardado",
      text2: "Las horas de inicio y fin se actualizaron.",
    })
    onOpenChange(false)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Horario silencioso"
      description="Fuera de este rango se respetan los canales globales de notificación."
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            <XIcon className="size-4 shrink-0" />
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            disabled={!isDirty || updateProfileMutation.isPending}
            className="flex-1"
            onClick={handleSave}
          >
            {updateProfileMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
    >
      <SummarySection title="Horario" icon={ClockFadingIcon}>
        <WheelField
          label="Inicio"
          valueLabel={formatTimeForDisplay(start)}
          icon={ClockIcon}
          disabled={updateProfileMutation.isPending}
        >
          <TimePairWheels
            value={start}
            onChange={setStart}
            minuteStep={5}
            disabled={updateProfileMutation.isPending}
          />
        </WheelField>
        <WheelField
          label="Fin"
          valueLabel={formatTimeForDisplay(end)}
          icon={ClockIcon}
          disabled={updateProfileMutation.isPending}
        >
          <TimePairWheels
            value={end}
            onChange={setEnd}
            minuteStep={5}
            disabled={updateProfileMutation.isPending}
          />
        </WheelField>
      </SummarySection>
    </BottomSheet>
  )
}
