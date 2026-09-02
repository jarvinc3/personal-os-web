"use client"

import { ConnectGmailSheet } from "@/src/modules/finance/components/sync/connect-gmail-sheet"
import { EmailSourceSheet } from "@/src/modules/finance/components/sync/email-source-sheet"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import {
  useEmailSources,
} from "@/src/modules/finance/hooks/use-email-sources"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { parseOAuthSuccessParam } from "@/src/modules/finance/lib/gmail-oauth"
import type { FinanceEmailSource } from "@/src/modules/finance/types/entities"
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
import { MailIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

type FinanceSyncListProps = {
  enabled: boolean
}

function sourceRowValue(
  source: FinanceEmailSource,
  accountName?: string,
  cardName?: string,
): string {
  const dest = accountName
    ? `Cuenta · ${accountName}`
    : cardName
      ? `Tarjeta · ${cardName}`
      : "Sin destino"
  const synced = source.lastSyncedAt
    ? source.lastSyncedAt.slice(0, 10)
    : "Nunca sincronizada"
  return `${source.bankDomain} · ${dest} · ${synced}`
}

export function FinanceSyncList({ enabled }: FinanceSyncListProps) {
  const searchParams = useSearchParams()
  const oauthState = parseOAuthSuccessParam(searchParams.get("success"))
  const [connectOpen, setConnectOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceEmailSource | null>(null)
  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const sourcesQuery = useEmailSources(enabled)

  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const sources = sourcesQuery.data ?? []
  const hasTargets = accounts.length > 0 || cards.length > 0

  const accountById = useMemo(
    () => new Map(accounts.map((item) => [item.id, item.name])),
    [accounts],
  )
  const cardById = useMemo(
    () => new Map(cards.map((item) => [item.id, item.name])),
    [cards],
  )

  const errorMessage = sourcesQuery.error
    ? financeErrorMessage(sourcesQuery.error)
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
          Gmail quedó conectado. Revisa el destino (cuenta o tarjeta) y lanza un
          sync cuando quieras.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <SummarySection
        title="Gmail"
        icon={MailIcon}
        right={
          <Button
            size="sm"
            variant="ghost"
            disabled={!enabled || !hasTargets}
            onClick={() => setConnectOpen(true)}
          >
            <PlusIcon />
            Conectar Gmail
          </Button>
        }
      >
        {sourcesQuery.isPending && !sourcesQuery.data ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : sources.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MailIcon />
              </EmptyMedia>
              <EmptyTitle>Aún no hay fuentes</EmptyTitle>
              <EmptyDescription>
                {hasTargets
                  ? "Conecta Gmail (solo lectura) para importar movimientos de tus bancos."
                  : "Crea una cuenta o una tarjeta en Cuentas antes de conectar Gmail."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {hasTargets ? (
                <Button onClick={() => setConnectOpen(true)}>
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
          sources.map((source, index) => (
            <div key={source.id}>
              <SettingsRow
                label={source.label || source.emailAddress}
                value={sourceRowValue(
                  source,
                  source.accountId
                    ? accountById.get(source.accountId)
                    : undefined,
                  source.cardId ? cardById.get(source.cardId) : undefined,
                )}
                icon={MailIcon}
                onPress={() => setEditing(source)}
                isLast={index === sources.length - 1}
              />
            </div>
          ))
        )}
      </SummarySection>

      <ConnectGmailSheet
        open={connectOpen}
        onOpenChange={setConnectOpen}
        accounts={accounts}
        cards={cards}
      />
      <EmailSourceSheet
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        source={editing}
        accounts={accounts}
        cards={cards}
      />
    </>
  )
}
