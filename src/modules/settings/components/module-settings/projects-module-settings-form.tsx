"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui";
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable";
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet";
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config";
import { OptionRow, SwitchFieldRow } from "@/src/shared/components/layout/form-blocks";
import { RadioGroup, RadioGroupItem } from "@/src/shared/components/ui/radio-group";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { getModule } from "@/src/shared/constants/module-registry";
import { appToast } from "@/src/shared/lib/app-toast";
import { createSheetSubmit } from "@/src/shared/lib/sheet-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, ArrowRightLeft, Bell, BriefcaseBusiness, Columns3, LayoutGrid } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const MODULE_ACCENT = getModule("projects").accent

const schema = z.object({
  defaultView: z.enum(["board", "list", "timeline"]),
  sortDirection: z.enum(["asc", "desc"]),
  showArchived: z.boolean(),
  dueDateReminders: z.boolean(),
  statusChanges: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function ProjectsModuleSettingsForm({ onDone }: { onDone: () => void }) {
  const { config, updateConfig, updateMutation } =
    useUserModuleConfig("projects")
  const moduleEnable = useModuleSheetEnable("projects")

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
      sortDirection: config.sortDirection,
      showArchived: config.showArchived,
      dueDateReminders: config.notifications.dueDateReminders,
      statusChanges: config.notifications.statusChanges,
    },
  })

  const defaultView = useWatch({ control, name: "defaultView" })

  const formValues = useMemo(
    () => ({
      defaultView: config.defaultView,
      sortDirection: config.sortDirection,
      showArchived: config.showArchived,
      dueDateReminders: config.notifications.dueDateReminders,
      statusChanges: config.notifications.statusChanges,
    }),
    [config]
  )

  useProfileSheetFormSync(true, reset, formValues)

  useEffect(() => {
    moduleEnable.syncPendingOnSheetOpen()
  }, [moduleEnable.syncPendingOnSheetOpen])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    await updateConfig(
      {
        defaultView: values.defaultView,
        sortDirection: values.sortDirection,
        showArchived: values.showArchived,
        notifications: {
          dueDateReminders: values.dueDateReminders,
          statusChanges: values.statusChanges,
        },
      },
      { isEnabled: moduleEnable.pendingEnabled }
    )
    appToast.success({
      text1: "Proyectos actualizado",
      text2: "Configuración guardada.",
    })
    onDone()
  })

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <ModuleSheetEnableRow
        state={moduleEnable.state}
        isEnabled={moduleEnable.sheetEnabled}
        onEnabledChange={moduleEnable.handleEnabledChange}
        disabled={updateMutation.isPending}
      />

      <SummarySection title="Vista por defecto" icon={Columns3}>
        <RadioGroup
          value={defaultView}
          onValueChange={(v) =>
            setValue("defaultView", v as FormValues["defaultView"], {
              shouldDirty: true,
            })
          }
        >
          {(["board", "list", "timeline"] as const).map((v) => (
            <OptionRow
              key={v}
              icon={LayoutGrid}
              iconColor={MODULE_ACCENT}
              label={v}
              selected={defaultView === v}
              onPress={() => setValue("defaultView", v, { shouldDirty: true })}
              trailing={<RadioGroupItem value={v} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>

      <SummarySection title="Preferencias" icon={BriefcaseBusiness}>
        <Controller
          control={control}
          name="showArchived"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Archive}
              iconColor={MODULE_ACCENT}
              label="Mostrar archivados"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="dueDateReminders"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Bell}
              iconColor={MODULE_ACCENT}
              label="Recordatorios de fecha"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="statusChanges"
          render={({ field }) => (
            <SwitchFieldRow
              icon={ArrowRightLeft}
              iconColor={MODULE_ACCENT}
              label="Cambios de estado"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>
      <Button
        type="submit"
        className="h-11 w-full"
        disabled={
          !(isDirty || moduleEnable.isEnabledDirty) || updateMutation.isPending
        }
      >
        {updateMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
        {updateMutation.isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  )
}
