"use client"

import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import type { AgendaModuleConfig } from "@/src/modules/settings/types/module-config.types"
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
  Bell,
  Briefcase,
  CalendarCheck,
  CalendarCog,
  CalendarDays,
  SaveIcon,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  agendaModuleSchema,
  type AgendaModuleFormValues,
} from "@/src/modules/settings/lib/agenda-module-form"

const MODULE_ACCENT = getModule("agenda").accent

const VIEW_OPTIONS: {
  value: AgendaModuleConfig["defaultView"]
  label: string
}[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
]

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

  const defaultView = useWatch({ control, name: "defaultView" })
  const weekStartsOn = useWatch({ control, name: "weekStartsOn" })

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
      <SummarySection title="Vista por defecto" icon={CalendarCog}>
        <RadioGroup
          value={defaultView}
          onValueChange={(v) =>
            setValue(
              "defaultView",
              v as AgendaModuleFormValues["defaultView"],
              {
                shouldDirty: true,
              }
            )
          }
        >
          {VIEW_OPTIONS.map((o) => (
            <OptionRow
              key={o.value}
              icon={CalendarDays}
              iconColor={MODULE_ACCENT}
              label={o.label}
              selected={defaultView === o.value}
              onPress={() =>
                setValue("defaultView", o.value, { shouldDirty: true })
              }
              trailing={<RadioGroupItem value={o.value} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>
      <SummarySection title="Semana inicia" icon={CalendarCog}>
        <RadioGroup
          value={weekStartsOn}
          onValueChange={(v) =>
            setValue("weekStartsOn", v as "0" | "1", { shouldDirty: true })
          }
        >
          <OptionRow
            icon={CalendarDays}
            iconColor={MODULE_ACCENT}
            label="Lunes"
            selected={weekStartsOn === "1"}
            onPress={() => setValue("weekStartsOn", "1", { shouldDirty: true })}
            trailing={<RadioGroupItem value="1" />}
          />
          <OptionRow
            icon={CalendarDays}
            iconColor={MODULE_ACCENT}
            label="Domingo"
            selected={weekStartsOn === "0"}
            onPress={() => setValue("weekStartsOn", "0", { shouldDirty: true })}
            trailing={<RadioGroupItem value="0" />}
          />
        </RadioGroup>
      </SummarySection>
      <SummarySection title="Preferencias" icon={Briefcase}>
        <Controller
          control={control}
          name="workingHoursEnabled"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Briefcase}
              iconColor={MODULE_ACCENT}
              label="Horario laboral"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="eventReminders"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Bell}
              iconColor={MODULE_ACCENT}
              label="Recordatorios de eventos"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="dailyAgenda"
          render={({ field }) => (
            <SwitchFieldRow
              icon={CalendarCheck}
              iconColor={MODULE_ACCENT}
              label="Agenda diaria"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>
    </FormScreen>
  )
}
