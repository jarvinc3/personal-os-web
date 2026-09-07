"use client"

import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import {
  parseOAuthNextPath,
  parseOAuthSuccessParam,
} from "@/src/modules/finance/lib/gmail-oauth"
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
  const next = parseOAuthNextPath(searchParams.get("next"))
  const failed = state === "error" || state === "none"
  const nextLabel =
    next === APP_ROUTES.app.financeAccounts ? "Ir a Cuentas" : "Ir a Sincronizar"
  const href =
    state === "ok" ? `${next}?success=true` : next

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
            ? "Google no autorizó la cuenta o el retorno falló. No se importó nada. Vuelve a intentarlo."
            : "La cuenta quedó vinculada a la institución. Lanza un sync cuando quieras."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href={href}>{nextLabel}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
