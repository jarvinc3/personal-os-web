"use client"

import { HealthPreferencesSection } from "@/src/modules/health/settings/components/preferences-section"
import { HealthUnitsSection } from "@/src/modules/health/settings/components/units-section"
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
  healthModuleSchema,
  type HealthModuleFormValues,
} from "./lib/health-module-form"

const MODULE_ACCENT = getModule("health").accent

export function HealthModuleSettingsForm({ onDone }: { onDone: () => void }) {
  const { config, updateConfig, updateMutation } = useUserModuleConfig("health")
  const moduleEnable = useModuleSheetEnable("health")

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<HealthModuleFormValues>({
    resolver: zodResolver(healthModuleSchema),
    defaultValues: {
      units: config.units,
      dashboardPeriod: config.dashboardPeriod,
      hideSensitiveMetrics: config.privacy.hideSensitiveMetrics,
      goalReminders: config.notifications.goalReminders,
      weeklySummary: config.notifications.weeklySummary,
    },
  })

  const formValues = useMemo(
    () => ({
      units: config.units,
      dashboardPeriod: config.dashboardPeriod,
      hideSensitiveMetrics: config.privacy.hideSensitiveMetrics,
      goalReminders: config.notifications.goalReminders,
      weeklySummary: config.notifications.weeklySummary,
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
        units: values.units,
        dashboardPeriod: values.dashboardPeriod,
        privacy: { hideSensitiveMetrics: values.hideSensitiveMetrics },
        notifications: {
          goalReminders: values.goalReminders,
          weeklySummary: values.weeklySummary,
        },
      },
      { isEnabled: moduleEnable.pendingEnabled }
    )
    moduleEnable.markSaved()
    appToast.success({
      text1: "Salud actualizado",
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

      <HealthUnitsSection control={control} setValue={setValue} />
      <HealthPreferencesSection control={control} />
    </FormScreen>
  )
}
