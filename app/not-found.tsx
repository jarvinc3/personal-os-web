import { AppLogo } from "@/src/shared/components/brand/app-logo"
import { Button } from "@/src/shared/components/ui/button"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { ArrowLeftIcon, MailIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que buscas no existe.",
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <Link
          href={APP_ROUTES.marketing.landing}
          className="group relative flex items-center gap-2.5"
        >
          <AppLogo
            size="lg"
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
          />
          <span className="text-xl font-semibold tracking-tight">
            Personal OS
          </span>
          <LinkPendingOverlay />
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-text bg-accent text-3xl font-bold shadow-[4px_4px_0px_0px_#111827]">
            404
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Página no encontrada
          </h1>
          <p className="max-w-md text-base text-muted-foreground">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="shadow-[4px_4px_0px_0px_#111827] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <Link href={APP_ROUTES.marketing.landing} className="relative">
              <ArrowLeftIcon className="size-4 shrink-0" />
              Volver al inicio
              <LinkPendingOverlay spinnerClassName="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-text shadow-[4px_4px_0px_0px_#111827] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <Link href="/contact" className="relative">
              <MailIcon className="size-4 shrink-0" />
              Contactar soporte
              <LinkPendingOverlay spinnerClassName="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
