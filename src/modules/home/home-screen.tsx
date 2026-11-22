"use client"

import { useAuthGuard } from "@/src/modules/auth"
import {
  FinanceHomeMonthSummary,
  FinanceHomeWeeklySummary,
  QuickEntryBar,
} from "@/src/modules/finance"
import { KeepAwakeHomeSection } from "@/src/modules/keep-awake"
import { useProfile } from "@/src/modules/settings"
import { resolveHomeDisplayName } from "@/src/modules/home/lib/display-name"
import { buttonVariants } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { BellRing, Settings, UserIcon } from "lucide-react"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"

export function HomeScreen() {
  return <HomeScreenBody />
}

function HomeScreenBody() {
  const { user } = useAuthGuard()
  const { profileQuery } = useProfile()
  const profile = profileQuery.data
  const displayName = resolveHomeDisplayName({
    profileFullName: profile?.fullName,
    userFullName: user?.fullName,
  })

  usePageHeader(
    {
      subtitle: "Hola, bienvenido",
      title: displayName,
    },
    [displayName]
  )

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 pb-16 md:px-6">
      <SummarySection icon={UserIcon} title="Tareas rápidas">
        <div className="grid grid-cols-3 gap-1">
          <Link
            href={APP_ROUTES.app.notifications}
            className={cn(
              buttonVariants({ variant: "outline", className: "relative" })
            )}
          >
            <span className="hidden sm:block">Notificaciones</span>
            <BellRing className="size-4" />
            <LinkPendingOverlay />
          </Link>

          <Link
            href={APP_ROUTES.app.settings}
            className={cn(
              buttonVariants({ variant: "outline", className: "relative" })
            )}
          >
            <span className="hidden sm:block">Configuración</span>
            <Settings className="size-4" />
            <LinkPendingOverlay />
          </Link>
        </div>
      </SummarySection>

      <FinanceHomeMonthSummary />

      <FinanceHomeWeeklySummary />

      <QuickEntryBar />

      <KeepAwakeHomeSection />
    </div>
  )
}
