"use client"

import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import {
  OptionRow,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import { FormScreen } from "@/src/shared/components/forms/form-screen"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CalendarDays,
  EyeOff,
  HeartPulse,
  Ruler,
  SaveIcon,
  Target,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  healthModuleSchema,
  type HealthModuleFormValues,
} from "@/src/modules/settings/lib/health-module-form"

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

  const units = useWatch({ control, name: "units" })

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
        onSubmit()
      }}
      submitLabel="Guardar"
      submitIcon={SaveIcon}
      isSubmitting={updateMutation.isPending}
      submitDisabled={
        !(isDirty || moduleEnable.isEnabledDirty) || updateMutation.isPending
      }
    >
      <ModuleSheetEnableRow
        state={moduleEnable.state}
        isEnabled={moduleEnable.sheetEnabled}
        onEnabledChange={moduleEnable.handleEnabledChange}
        disabled={updateMutation.isPending}
      />

      <SummarySection title="Unidades" icon={Ruler}>
        <RadioGroup
          value={units}
          onValueChange={(v) =>
            setValue("units", v as HealthModuleFormValues["units"], {
              shouldDirty: true,
            })
          }
        >
          <OptionRow
            icon={Ruler}
            iconColor={MODULE_ACCENT}
            label="Métrico"
            selected={units === "metric"}
            onPress={() => setValue("units", "metric", { shouldDirty: true })}
            trailing={<RadioGroupItem value="metric" />}
          />
          <OptionRow
            icon={Ruler}
            iconColor={MODULE_ACCENT}
            label="Imperial"
            selected={units === "imperial"}
            onPress={() => setValue("units", "imperial", { shouldDirty: true })}
            trailing={<RadioGroupItem value="imperial" />}
          />
        </RadioGroup>
      </SummarySection>

      <SummarySection title="Preferencias" icon={HeartPulse}>
        <Controller
          control={control}
          name="hideSensitiveMetrics"
          render={({ field }) => (
            <SwitchFieldRow
              icon={EyeOff}
              iconColor={MODULE_ACCENT}
              label="Ocultar métricas sensibles"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="goalReminders"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Target}
              iconColor={MODULE_ACCENT}
              label="Recordatorios de metas"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="weeklySummary"
          render={({ field }) => (
            <SwitchFieldRow
              icon={CalendarDays}
              iconColor={MODULE_ACCENT}
              label="Resumen semanal"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>
    </FormScreen>
  )
}
