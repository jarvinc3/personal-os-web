import { Suspense } from "react"

import { LandingScreen } from "@/src/modules/landing"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Personal OS — Tu sistema operativo personal con IA",
  description:
    "Centraliza y automatiza la gestión de tus finanzas, agenda, proyectos, salud y suscripciones en una sola app potenciada por inteligencia artificial.",
}

export default function LandingPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <LandingScreen />
    </Suspense>
  )
}
