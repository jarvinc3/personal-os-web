"use client"

import { ProjectsPreferencesSection } from "@/src/modules/projects/settings/components/preferences-section"
import { ProjectsViewSection } from "@/src/modules/projects/settings/components/view-section"
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
  projectsModuleSchema,
  type ProjectsModuleFormValues,
} from "./lib/projects-module-form"

const MODULE_ACCENT = getModule("projects").accent

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

      <ProjectsViewSection control={control} setValue={setValue} />
      <ProjectsPreferencesSection control={control} />
    </FormScreen>
  )
}
