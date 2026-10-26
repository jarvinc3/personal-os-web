import { ProjectsModuleSettingsScreen } from "@/src/modules/projects/settings/projects-module-settings-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function ProjectsSettingsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <ProjectsModuleSettingsScreen />
    </Suspense>
  )
}
