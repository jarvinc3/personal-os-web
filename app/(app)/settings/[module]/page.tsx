import { Suspense } from "react"
import { notFound } from "next/navigation"

import { ModuleSettingsPage } from "@/src/modules/settings/pages/module-settings-page"
import { isModuleSlug } from "@/src/shared/constants/module-registry"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type ModuleSettingsRouteProps = {
  params: Promise<{ module: string }>
}

export default async function ModuleSettingsRoute({
  params,
}: ModuleSettingsRouteProps) {
  const { module: moduleSlug } = await params
  if (!isModuleSlug(moduleSlug)) {
    notFound()
  }

  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <ModuleSettingsPage slug={moduleSlug} />
    </Suspense>
  )
}
