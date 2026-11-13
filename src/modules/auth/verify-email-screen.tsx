"use client"

import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import { Button, buttonVariants } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { appToast } from "@/src/shared/lib/app-toast"
import { ArrowLeftIcon, MailIcon } from "lucide-react"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"

export function VerifyEmailScreen() {
  return <VerifyEmailScreenBody />
}

function VerifyEmailScreenBody() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [isResending, setIsResending] = useState(false)

  const handleResend = useCallback(async () => {
    if (!email) {
      appToast.error({
        text1: "Correo no disponible",
        text2: "Vuelve a registrarte para recibir el enlace.",
      })
      return
    }

    setIsResending(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      })

      if (error) {
        throw error
      }

      appToast.success({
        text1: "Correo enviado",
        text2: "Revisa tu bandeja de entrada y spam.",
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo reenviar el correo"
      appToast.error({ text1: "Error al reenviar", text2: message })
    } finally {
      setIsResending(false)
    }
  }, [email])

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-muted p-4">
          <MailIcon className="size-10 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold">Verifica tu correo</h1>
        <p className="text-muted-foreground">
          Enviamos un enlace de confirmación a{" "}
          <span className="font-medium text-foreground">
            {email || "tu correo"}
          </span>
          . Ábrelo para activar tu cuenta e iniciar sesión.
        </p>
      </div>

      <Button disabled={isResending} onClick={() => void handleResend()}>
        <MailIcon className="size-4 shrink-0" />
        {isResending ? "Enviando..." : "Reenviar correo"}
      </Button>

      <Link
        href={APP_ROUTES.auth.login}
        className={cn(
          buttonVariants({ variant: "ghost", className: "relative" })
        )}
      >
        <ArrowLeftIcon className="size-4 shrink-0" />
        Volver al inicio
        <LinkPendingOverlay />
      </Link>
    </div>
  )
}
