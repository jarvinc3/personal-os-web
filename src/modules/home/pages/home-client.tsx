"use client"

import { useAuthGuard } from "@/src/modules/auth";
import { useProfile } from "@/src/modules/settings/hooks/use-profile";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import { LoadingView } from "@/src/shared/components/layout/loading-view";
import { Button } from "@/src/shared/components/ui/button";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { usePageHeader } from "@/src/shared/hooks/use-page-header";
import { BellRing, Brain, ChevronRight, Landmark, Monitor, Settings, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function HomeClient() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuthGuard()
  const { profileQuery } = useProfile()
  const [open, setOpen] = useState(false)
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
    <div className="flex flex-col gap-6 p-4 pb-16 mx-auto max-w-2xl md:px-6">
      <SummarySection title={`Hola, ${displayName}`} icon={UserIcon}>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Personaliza tu experiencia en Personal OS desde un solo lugar.
          </p>
          <p className="text-sm text-muted-foreground">
            Accede al agente IA, ajustes, módulos y notificaciones.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <Button variant="outline" asChild>
            <Link href={APP_ROUTES.app.notifications}>
              <BellRing className="size-4" />
              Notificaciones
              <ChevronRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={APP_ROUTES.app.chat}>
              <Brain className="size-4" />
              Agente IA
              <ChevronRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={APP_ROUTES.app.settings}>
              <Settings className="size-4" />
              Configuración
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </SummarySection>

      <SummarySection title="Finanzas" icon={Landmark}>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Gestiona cuentas y movimientos desde el módulo de finanzas.
          </p>
          <p className="text-sm text-muted-foreground">
            Abre el resumen, cuentas, presupuestos y planificación. Si el
            módulo está apagado, Finanzas te lleva a activarlo en Ajustes.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={APP_ROUTES.app.finance}>
            Abrir Finanzas
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </SummarySection>

      <SummarySection title="Keep Awake" icon={Monitor}>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Mantén la pantalla despierta con Wake Lock y un miniplayer flotante.
          </p>
          <p className="text-sm text-muted-foreground">
            Ideal para presentaciones, lectura o trabajo sin que el equipo se
            suspenda.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={APP_ROUTES.app.keepAwake}>
            Abrir Keep Awake
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </SummarySection>

      <Button onClick={() => setOpen(true)}>Open Floating Sheet</Button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Floating Sheet"
        variant="floating"
        actions={{
          close: <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Entendido</Button>,
        }}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Floating Player is a floating sheet that can be used to show a screen with any results or information.
          </p>
        </div>
      </BottomSheet>
    </div>
  )
}
