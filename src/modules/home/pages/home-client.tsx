"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/src/shared/components/ui/card"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { ChevronRight, Monitor } from "lucide-react"
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
      subtitle: "Hola,",
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
      <Card>
        <CardHeader>
          <CardTitle>
            <p className="text-sm text-muted-foreground">
              Hola,{" "}
              <span className="text-xl font-semibold text-foreground">
                {displayName}
              </span>
            </p>
          </CardTitle>
          <CardDescription>Bienvenido a Personal OS.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Personaliza tu experiencia en Personal OS desde un solo lugar.
          </p>
          <p className="text-sm text-muted-foreground">
            Configura tu cuenta, preferencias, módulos y notificaciones.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full sm:w-auto">
            <Link href={APP_ROUTES.app.settings}>
              Ir a Ajustes
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="size-4 text-muted-foreground" aria-hidden />
            Keep Awake
          </CardTitle>
          <CardDescription>
            Mantén la pantalla despierta con Wake Lock y un miniplayer flotante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ideal para presentaciones, lectura o trabajo sin que el equipo se
            suspenda. El cronómetro vive solo en el Picture-in-Picture.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={APP_ROUTES.app.keepAwake}>
              Abrir Keep Awake
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
