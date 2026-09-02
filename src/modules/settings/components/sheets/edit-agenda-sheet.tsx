"use client"

import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import type { AgendaModuleConfig } from "@/src/modules/settings/types/module-config.types"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { OptionRow, SwitchFieldRow } from "@/src/shared/components/layout/form-blocks";
import { SummarySection } from "@/src/shared/components/layout/summary";
import { Button } from "@/src/shared/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/src/shared/components/ui/radio-group";
import { Spinner } from "@/src/shared/components/ui/spinner"
import { getModule } from "@/src/shared/constants/module-registry"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Briefcase, CalendarCog, CalendarDays } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const MODULE_ACCENT = getModule("agenda").accent

const schema = z.object({
  defaultView: z.enum(["day", "week", "month"]),
  weekStartsOn: z.enum(["0", "1"]),
  defaultReminderMinutes: z.number().min(0).max(120),
  workingHoursEnabled: z.boolean(),
  eventReminders: z.boolean(),
  dailyAgenda: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const VIEW_OPTIONS: {
  value: AgendaModuleConfig["defaultView"]
  label: string
}[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
]

export function EditAgendaSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { config, updateConfig, updateMutation } = useUserModuleConfig("agenda")
  const moduleEnable = useModuleSheetEnable("agenda")
  const router = useRouter()

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
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
  useProfileSheetFormSync(open, reset, formValues)

  useEffect(() => {
    if (open) moduleEnable.syncPendingOnSheetOpen()
  }, [open, moduleEnable])

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
    onOpenChange(false)
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Agenda"
      description={config.fieldGuide}
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            disabled={!isDirty || updateMutation.isPending}
            className="flex-1"
            onClick={onSubmit}
          >
            {updateMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            {updateMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
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
            setValue("defaultView", v as FormValues["defaultView"], {
              shouldDirty: true,
            })
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
              label="Agenda diaria"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
