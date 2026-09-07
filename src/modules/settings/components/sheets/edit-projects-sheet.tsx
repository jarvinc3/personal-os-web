"use client"

import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui";
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable";
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet";
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config";
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import { OptionRow, SwitchFieldRow } from "@/src/shared/components/layout/form-blocks";
import { Button } from "@/src/shared/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/src/shared/components/ui/radio-group";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { getModule } from "@/src/shared/constants/module-registry";
import { appToast } from "@/src/shared/lib/app-toast";
import { createSheetSubmit } from "@/src/shared/lib/sheet-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, Columns3, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
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

export function EditProjectsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { config, updateConfig, updateMutation } =
    useUserModuleConfig("projects")
  const moduleEnable = useModuleSheetEnable("projects")
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
    onOpenChange(false)
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Proyectos"
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
              label="Cambios de estado"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
