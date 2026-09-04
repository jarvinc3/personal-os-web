"use client"

import { AssignEmailMessageSheet } from "@/src/modules/finance/components/sync/assign-email-message-sheet"
import { ConnectGmailSheet } from "@/src/modules/finance/components/sync/connect-gmail-sheet"
import { EmailSourceSheet } from "@/src/modules/finance/components/sync/email-source-sheet"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import {
  useEmailSources,
  usePendingEmailMessages,
} from "@/src/modules/finance/hooks/use-email-sources"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  parseOAuthSuccessParam,
  type GmailOAuthNextPath,
} from "@/src/modules/finance/lib/gmail-oauth"
import type {
  FinanceEmailSource,
  FinancePendingEmailMessage,
} from "@/src/modules/finance/types/entities"
import { SettingsRow } from "@/src/shared/components/layout/settings-section"
import { SummarySection } from "@/src/shared/components/layout/summary"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { InboxIcon, MailIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

type FinanceSyncListProps = {
  enabled: boolean
  oauthNextPath?: GmailOAuthNextPath
}

function sourceRowValue(source: FinanceEmailSource): string {
  const dest = source.institutionName ?? "Institución"
  const status = source.isActive ? dest : `${dest} · Desconectada`
  const synced = source.lastSyncedAt
    ? source.lastSyncedAt.slice(0, 10)
    : "Nunca sincronizada"
  return `${source.bankDomain} · ${status} · ${synced}`
}

function pendingRowValue(message: FinancePendingEmailMessage): string {
  const payload = message.extractedPayload
  const amount =
    payload?.amount != null
      ? `${payload.amount} ${payload.currency ?? ""}`.trim()
      : message.lastFourHint
        ? `****${message.lastFourHint}`
        : "Sin monto"
  return `${message.institutionName} · ${amount}`
}

export function FinanceSyncList({
  enabled,
  oauthNextPath = APP_ROUTES.app.financeSync,
}: FinanceSyncListProps) {
  const searchParams = useSearchParams()
  const oauthState = parseOAuthSuccessParam(searchParams.get("success"))
  const { emailSyncEnabled } = useFinanceEnabled()
  const [connectOpen, setConnectOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceEmailSource | null>(null)
  const [assigning, setAssigning] = useState<FinancePendingEmailMessage | null>(
    null,
  )
  const institutionsQuery = useInstitutions(enabled)
  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const sourcesQuery = useEmailSources(enabled)
  const pendingQuery = usePendingEmailMessages(enabled && emailSyncEnabled)

  const institutions = institutionsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const sources = sourcesQuery.data ?? []
  const pending = pendingQuery.data ?? []
  const hasInstitutions = institutions.some((item) => item.isActive)
  const visibleSources = sources.filter((source) => source.isActive)
  const disconnectedCount = sources.length - visibleSources.length

  const errorMessage = sourcesQuery.error
    ? financeErrorMessage(sourcesQuery.error)
    : pendingQuery.error
      ? financeErrorMessage(pendingQuery.error)
      : null

  return (
    <>
      {oauthState === "error" ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo conectar Gmail. Vuelve a intentar; no se importó nada.
        </p>
      ) : null}
      {oauthState === "ok" ? (
        <p className="rounded-xl border border-border bg-card p-3 text-sm">
          Gmail quedó conectado a la institución. Lanza un sync cuando quieras.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <SummarySection
        title="Movimientos por asignar"
        icon={InboxIcon}
      >
        {pendingQuery.isPending && !pendingQuery.data ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : pending.length === 0 ? (
          <p className="px-1 py-2 text-sm text-muted-foreground">
            No hay correos pendientes de cuenta o tarjeta.
          </p>
        ) : (
          pending.map((message, index) => (
            <SettingsRow
              key={message.id}
              label={message.extractedPayload?.merchant ?? message.gmailMessageId}
              value={pendingRowValue(message)}
              icon={InboxIcon}
              onPress={() => setAssigning(message)}
              isLast={index === pending.length - 1}
            />
          ))
        )}
      </SummarySection>

      <SummarySection
        title="Gmail"
        icon={MailIcon}
        right={
          <Button
            size="sm"
            variant="ghost"
            disabled={!enabled || !hasInstitutions || !emailSyncEnabled}
            onClick={() => setConnectOpen(true)}
          >
            <PlusIcon />
            Conectar Gmail
          </Button>
        }
      >
        {!emailSyncEnabled ? (
          <p className="px-1 pb-3 text-sm text-muted-foreground">
            La sincronización de correo está apagada en Ajustes.
          </p>
        ) : null}
        {sourcesQuery.isPending && !sourcesQuery.data ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : visibleSources.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MailIcon />
              </EmptyMedia>
              <EmptyTitle>Aún no hay fuentes</EmptyTitle>
              <EmptyDescription>
                {hasInstitutions
                  ? "Conecta Gmail (solo lectura) para importar movimientos de una institución."
                  : "Crea una institución en Cuentas antes de conectar Gmail."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {hasInstitutions ? (
                <Button
                  disabled={!emailSyncEnabled}
                  onClick={() => setConnectOpen(true)}
                >
                  Conectar Gmail
                </Button>
              ) : (
                <Button asChild>
                  <Link href={APP_ROUTES.app.financeAccounts}>Ir a Cuentas</Link>
                </Button>
              )}
            </EmptyContent>
          </Empty>
        ) : (
          visibleSources.map((source, index) => (
            <div key={source.id}>
              <SettingsRow
                label={source.label || source.emailAddress}
                value={sourceRowValue(source)}
                icon={MailIcon}
                onPress={() => setEditing(source)}
                isLast={index === visibleSources.length - 1}
              />
            </div>
          ))
        )}
        {disconnectedCount > 0 ? (
          <p className="px-1 pt-2 text-xs text-muted-foreground">
            {disconnectedCount} fuente{disconnectedCount === 1 ? "" : "s"}{" "}
            desconectada{disconnectedCount === 1 ? "" : "s"} oculta
            {disconnectedCount === 1 ? "" : "s"}.
          </p>
        ) : null}
      </SummarySection>

      <ConnectGmailSheet
        open={connectOpen}
        onOpenChange={setConnectOpen}
        institutions={institutions}
        nextPath={oauthNextPath}
        emailSyncEnabled={emailSyncEnabled}
      />
      <EmailSourceSheet
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        source={editing}
        institutions={institutions}
        emailSyncEnabled={emailSyncEnabled}
      />
      <AssignEmailMessageSheet
        open={Boolean(assigning)}
        onOpenChange={(open) => {
          if (!open) setAssigning(null)
        }}
        message={assigning}
        accounts={accounts}
        cards={cards}
      />
    </>
  )
}
