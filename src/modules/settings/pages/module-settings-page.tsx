"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { AgendaModuleSettingsForm } from "@/src/modules/settings/components/module-settings/agenda-module-settings-form"
import { FinanceModuleSettingsForm } from "@/src/modules/settings/components/module-settings/finance-module-settings-form"
import { HealthModuleSettingsForm } from "@/src/modules/settings/components/module-settings/health-module-settings-form"
import { ProjectsModuleSettingsForm } from "@/src/modules/settings/components/module-settings/projects-module-settings-form"
import { SubscriptionsModuleSettingsForm } from "@/src/modules/settings/components/module-settings/subscriptions-module-settings-form"
import type { ModuleSlug } from "@/src/modules/settings/types/module-config.types"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, type ReactNode } from "react"

const FORMS: Record<ModuleSlug, (props: { onDone: () => void }) => ReactNode> = {
  finance: (props) => <FinanceModuleSettingsForm {...props} />,
  agenda: (props) => <AgendaModuleSettingsForm {...props} />,
  projects: (props) => <ProjectsModuleSettingsForm {...props} />,
  subscriptions: (props) => <SubscriptionsModuleSettingsForm {...props} />,
  health: (props) => <HealthModuleSettingsForm {...props} />,
}

export function ModuleSettingsPage({ slug }: { slug: ModuleSlug }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthGuard()
  const moduleDef = getModule(slug)

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.settings)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: moduleDef.label,
      onBack: handleBack,
    },
    [moduleDef.label, handleBack],
  )

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return <LoadingView variant="screen" />
  }

  return FORMS[slug]({ onDone: handleBack })
}
