"use client"

import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { parseOAuthSuccessParam } from "@/src/modules/finance/lib/gmail-oauth"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { MailIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export function FinanceSyncOAuthClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinanceSyncOAuthResult />
    </FinanceAuthenticatedPage>
  )
}

function FinanceSyncOAuthResult() {
  const searchParams = useSearchParams()
  const state = parseOAuthSuccessParam(searchParams.get("success"))
  const failed = state === "error" || state === "none"

  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MailIcon />
        </EmptyMedia>
        <EmptyTitle>
          {failed ? "No se pudo conectar Gmail" : "Gmail conectado"}
        </EmptyTitle>
        <EmptyDescription>
          {failed
            ? "Google no autorizó la cuenta o el retorno falló. No se importó nada. Vuelve a intentarlo desde Sincronizar."
            : "La cuenta quedó vinculada. Revisa el destino y lanza un sync cuando quieras."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link
            href={
              state === "ok"
                ? `${APP_ROUTES.app.financeSync}?success=true`
                : APP_ROUTES.app.financeSync
            }
          >
            Ir a Sincronizar
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
