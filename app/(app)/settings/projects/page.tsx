import { ProjectsModuleSettingsClient } from "@/src/modules/settings/pages/projects-module-settings"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function ProjectsSettingsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <ProjectsModuleSettingsClient />
    </Suspense>
  )
}
