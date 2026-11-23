"use client"

import { AgendaPreferencesSection } from "@/src/modules/agenda/settings/components/preferences-section"
import { AgendaViewSection } from "@/src/modules/agenda/settings/components/view-section"
import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import { FormScreen } from "@/src/shared/components/forms/form-screen"
import { getModule } from "@/src/shared/constants/module-registry"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SaveIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import {
  agendaModuleSchema,
  type AgendaModuleFormValues,
} from "./lib/agenda-module-form"

const MODULE_ACCENT = getModule("agenda").accent

export function AgendaModuleSettingsForm({ onDone }: { onDone: () => void }) {
  const { config, updateConfig, updateMutation } = useUserModuleConfig("agenda")
  const moduleEnable = useModuleSheetEnable("agenda")

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<AgendaModuleFormValues>({
    resolver: zodResolver(agendaModuleSchema),
    defaultValues: {
      defaultView: config.defaultView,
      weekStartsOn: String(config.weekStartsOn) as "0" | "1",
      defaultReminderMinutes: config.defaultReminderMinutes,
      workingHoursEnabled: config.workingHours.enabled,
      eventReminders: config.notifications.eventReminders,
      dailyAgenda: config.notifications.dailyAgenda,
    },
  })

  const formValues = useMemo(
    () => ({
      defaultView: config.defaultView,
      weekStartsOn: String(config.weekStartsOn) as "0" | "1",
      defaultReminderMinutes: config.defaultReminderMinutes,
      workingHoursEnabled: config.workingHours.enabled,
      eventReminders: config.notifications.eventReminders,
      dailyAgenda: config.notifications.dailyAgenda,
    }),
    [config]
  )
  useProfileSheetFormSync(true, reset, formValues)

  const syncPendingOnSheetOpen = moduleEnable.syncPendingOnSheetOpen
  useEffect(() => {
    syncPendingOnSheetOpen()
  }, [syncPendingOnSheetOpen])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    await updateConfig(
      {
        defaultView: values.defaultView,
        weekStartsOn: Number(values.weekStartsOn) as 0 | 1,
        defaultReminderMinutes: values.defaultReminderMinutes,
        workingHours: {
          ...config.workingHours,
          enabled: values.workingHoursEnabled,
        },
        notifications: {
          eventReminders: values.eventReminders,
          dailyAgenda: values.dailyAgenda,
        },
      },
      { isEnabled: moduleEnable.pendingEnabled }
    )
    moduleEnable.markSaved()
    appToast.success({
      text1: "Agenda actualizada",
      text2: "Configuración guardada.",
    })
    onDone()
  })

  return (
    <FormScreen
      onSubmit={(event) => {
        event.preventDefault()
        void onSubmit()
      }}
      submitEmphasis={moduleEnable.isEnabledDirty}
      submitLabel="Guardar"
      submitIcon={SaveIcon}
      isSubmitting={updateMutation.isPending}
      submitDisabled={
        !(isDirty || moduleEnable.isEnabledDirty) || updateMutation.isPending
      }
    >
      <ModuleSheetEnableRow
        state={moduleEnable.state}
        accentColor={MODULE_ACCENT}
        isEnabled={moduleEnable.sheetEnabled}
        pending={moduleEnable.isEnabledDirty}
        onEnabledChange={moduleEnable.handleEnabledChange}
        disabled={updateMutation.isPending}
      />
      <AgendaViewSection control={control} setValue={setValue} />
      <AgendaPreferencesSection control={control} />
    </FormScreen>
  )
}
