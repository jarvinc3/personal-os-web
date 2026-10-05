"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { FinanceHomeMonthSummary } from "@/src/modules/finance"
import { KeepAwakeHomeSection } from "@/src/modules/keep-awake"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { BellRing, Brain, Settings, UserIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function HomeClient() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuthGuard()
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return <LoadingView variant="screen" />
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 pb-16 md:px-6">
      <SummarySection icon={UserIcon} title={`Hola, bienvenido ${displayName}`}>
        <div className="grid grid-cols-3 gap-1">
          <Button variant="outline" asChild>
            <Link href={APP_ROUTES.app.chat}>
              <span className="hidden sm:block">Chat</span>
              <Brain className="size-4" />
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href={APP_ROUTES.app.notifications}>
              <span className="hidden sm:block">Notificaciones</span>
              <BellRing className="size-4" />
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href={APP_ROUTES.app.settings}>
              <span className="hidden sm:block">Configuración</span>
              <Settings className="size-4" />
            </Link>
          </Button>
        </div>
      </SummarySection>

      <FinanceHomeMonthSummary />

      <KeepAwakeHomeSection />
    </div>
  )
}
