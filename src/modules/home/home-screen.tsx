"use client"

import { useAuthGuard } from "@/src/modules/auth"
import {
  FinanceHomeMonthSummary,
  FinanceHomeWeeklySummary,
  QuickEntryBar,
} from "@/src/modules/finance"
import { KeepAwakeHomeSection } from "@/src/modules/keep-awake"
import { useProfile } from "@/src/modules/settings"
import { Button } from "@/src/shared/components/ui/button"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { BellRing, Brain, Settings, UserIcon } from "lucide-react"
import {
  ChevronRightIcon,
  FlaskConicalIcon,
  GalleryVerticalEndIcon,
} from "lucide-react"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import Link from "next/link"

export function HomeScreen() {
  return <HomeScreenBody />
}

function HomeScreenBody() {
  const { user } = useAuthGuard()
  const { profileQuery } = useProfile()
  const profile = profileQuery.data
  const displayName = profile?.fullName ?? user?.fullName ?? "Usuario"

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
          <Button variant="outline" asChild>
            <Link href={APP_ROUTES.app.chat} className="relative">
              <span className="hidden sm:block">Chat</span>
              <Brain className="size-4" />
              <LinkPendingOverlay />
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href={APP_ROUTES.app.notifications} className="relative">
              <span className="hidden sm:block">Notificaciones</span>
              <BellRing className="size-4" />
              <LinkPendingOverlay />
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href={APP_ROUTES.app.settings} className="relative">
              <span className="hidden sm:block">Configuración</span>
              <Settings className="size-4" />
              <LinkPendingOverlay />
            </Link>
          </Button>
        </div>
      </SummarySection>

      <SummarySection icon={FlaskConicalIcon} title="Desarrollo">
        <Button variant="outline" asChild className="w-full justify-start">
          <Link href={APP_ROUTES.app.devCardGallery} className="relative">
            <GalleryVerticalEndIcon className="size-4 shrink-0" aria-hidden />
            <span className="flex-1 text-left">Galería de cards</span>
            <ChevronRightIcon className="size-4 shrink-0" aria-hidden />
            <LinkPendingOverlay />
          </Link>
        </Button>
      </SummarySection>

      <FinanceHomeMonthSummary />

      <FinanceHomeWeeklySummary />

      <QuickEntryBar />

      <KeepAwakeHomeSection />
    </div>
  )
}
