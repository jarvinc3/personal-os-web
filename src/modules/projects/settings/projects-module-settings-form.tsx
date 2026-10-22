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
  Archive,
  ArrowRightLeft,
  Bell,
  BriefcaseBusiness,
  CalendarRange,
  Columns3,
  List,
  SaveIcon,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  projectsModuleSchema,
  type ProjectsModuleFormValues,
} from "./lib/projects-module-form"

const MODULE_ACCENT = getModule("projects").accent

const PROJECT_VIEW_OPTIONS = [
  { value: "board", label: "Tablero", icon: Columns3 },
  { value: "list", label: "Lista", icon: List },
  { value: "timeline", label: "Cronograma", icon: CalendarRange },
] as const

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
  } = useForm<ProjectsModuleFormValues>({
    resolver: zodResolver(projectsModuleSchema),
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
        sortDirection: values.sortDirection,
        showArchived: values.showArchived,
        notifications: {
          dueDateReminders: values.dueDateReminders,
          statusChanges: values.statusChanges,
        },
      },
      { isEnabled: moduleEnable.pendingEnabled }
    )
    moduleEnable.markSaved()
    appToast.success({
      text1: "Proyectos actualizado",
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

      <SummarySection title="Vista por defecto" icon={Columns3}>
        <RadioGroup
          value={defaultView}
          onValueChange={(v) =>
            setValue(
              "defaultView",
              v as ProjectsModuleFormValues["defaultView"],
              {
                shouldDirty: true,
              }
            )
          }
        >
          {PROJECT_VIEW_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              icon={option.icon}
              iconColor={MODULE_ACCENT}
              label={option.label}
              selected={defaultView === option.value}
              onPress={() =>
                setValue("defaultView", option.value, { shouldDirty: true })
              }
              trailing={<RadioGroupItem value={option.value} />}
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
    </FormScreen>
  )
}
