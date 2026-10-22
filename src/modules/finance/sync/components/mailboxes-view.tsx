"use client"

import { AssignEmailMessageSheet } from "@/src/modules/finance/sync/components/assign-email-message-sheet"
import { ConnectGmailSheet } from "@/src/modules/finance/sync/components/connect-gmail-sheet"
import { EmailSourceSheet } from "@/src/modules/finance/sync/components/email-source-sheet"
import {
  EmailMessageHistorySection,
  EmailSyncLogsSection,
} from "@/src/modules/finance/sync/components/email-sync-history"
import { LinkInstitutionMailboxSheet } from "@/src/modules/finance/sync/components/link-institution-mailbox-sheet"
import { MailboxGroup } from "@/src/modules/finance/sync/components/mailbox-group"
import { MailboxSheet } from "@/src/modules/finance/sync/components/mailbox-sheet"
import { OauthGmailResultSheet } from "@/src/modules/finance/sync/components/oauth-gmail-result-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import {
  useApiReady,
  useEmailMailboxes,
  usePendingEmailMessages,
  useRecentEmailMessages,
  useRetryPendingEmail,
  useRunEmailSync,
} from "@/src/modules/finance/shared/hooks/use-email-sources"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useSheetListEntity } from "@/src/modules/finance/shared/hooks/use-sheet-entity"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type { FinancePendingEmailMessage } from "@/src/modules/finance/shared/types/entities"
import { Button } from "@/src/shared/components/ui/button"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { appToast } from "@/src/shared/lib/app-toast"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import {
  InboxIcon,
  MailIcon,
  PlusIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
} from "lucide-react"

function pendingRowValue(
  message: FinancePendingEmailMessage,
  display: FinanceMoneyDisplay
): string {
  const payload = message.extractedPayload
  const amount =
    payload?.amount != null
      ? formatFinanceMoney(payload.amount, {
          ...display,
          currency: payload.currency ?? display.currency,
        })
      : message.lastFourHint
        ? `****${message.lastFourHint}`
        : "Sin monto"
  const notesHint = payload?.notes?.trim() ? " · Con notas" : ""
  return `${message.institutionName} · ${amount}${notesHint}`
}

type PendingEmailRowProps = {
  message: FinancePendingEmailMessage
  display: FinanceMoneyDisplay
  isLast: boolean
  isRetrying: boolean
  onPress: () => void
  onRetry: () => void
}

function PendingEmailRow({
  message,
  display,
  isLast,
  isRetrying,
  onPress,
  onRetry,
}: PendingEmailRowProps) {
  const title = message.extractedPayload?.merchant ?? message.gmailMessageId
  return (
    <SummaryItem
      title={title}
      value={pendingRowValue(message, display)}
      icon={InboxIcon}
      onPress={onPress}
      isLast={isLast}
      trailing={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isRetrying}
          aria-label={`Reintentar ${title}`}
          onClick={onRetry}
        >
          {isRetrying ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <RefreshCwIcon className="size-4 shrink-0" />
          )}
          Reintentar
        </Button>
      }
    />
  )
}

export function FinanceMailboxesView({ enabled }: { enabled: boolean }) {
  const { emailSyncEnabled, emailSyncAutomatic, config, formatLocale } =
    useFinanceEnabled()
  const { run: runSync, pendingSourceId } = useRunEmailSync(emailSyncEnabled)
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }
  const { open: openConnectSheet, setOpen: setOpenConnectSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.connectGmail)
  const { open: openOauthResult, setOpen: setOpenOauthResult } = useSheetParam(
    FINANCE_SHEET_KEYS.oauthGmailResult
  )
  const {
    open: openMailboxSheet,
    sheetId: mailboxSheetId,
    setOpen: setOpenMailboxSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.mailbox)
  const {
    open: openSourceSheet,
    sheetId: sourceSheetId,
    setOpen: setOpenSourceSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.emailSource)
  const {
    open: openLinkSheet,
    sheetId: linkMailboxId,
    setOpen: setOpenLinkSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.linkInstitutionMailbox)
  const {
    open: openAssignSheet,
    sheetId: assignSheetId,
    setOpen: setOpenAssignSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.assignEmail)

  const institutionsQuery = useInstitutions(enabled)
  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const mailboxesQuery = useEmailMailboxes(enabled && emailSyncEnabled)
  const pendingQuery = usePendingEmailMessages(enabled && emailSyncEnabled)
  const messagesQuery = useRecentEmailMessages(enabled && emailSyncEnabled)
  const healthQuery = useApiReady(enabled && emailSyncEnabled)

  const institutions = institutionsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const mailboxes = mailboxesQuery.data ?? []
  const pending = infiniteListItems(pendingQuery.data)
  const sources = mailboxes.flatMap((mailbox) => mailbox.sources)
  const syncLogs = sources
    .flatMap((source) =>
      (source.logs ?? []).map((log) => ({
        ...log,
        sourceName: source.label || source.institutionName || "Banco",
      }))
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 20)
  const latestSyncLog = syncLogs[0]
  const latestFailedLog =
    latestSyncLog?.status === "FAILED" ? latestSyncLog : undefined
  const recentMessages = infiniteListItems(messagesQuery.data)
  const queueDown = healthQuery.data?.ready === false

  const errorMessage = mailboxesQuery.error
    ? financeErrorMessage(mailboxesQuery.error)
    : pendingQuery.error
      ? financeErrorMessage(pendingQuery.error)
      : null

  const editingMailbox = useSheetListEntity(
    openMailboxSheet,
    mailboxSheetId,
    mailboxesQuery.data,
    mailboxesQuery.isPending,
    setOpenMailboxSheet,
    true
  )
  const editingSource = useSheetListEntity(
    openSourceSheet,
    sourceSheetId,
    sources,
    mailboxesQuery.isPending,
    setOpenSourceSheet,
    true
  )
  const assigning = useSheetListEntity(
    openAssignSheet,
    assignSheetId,
    pending,
    pendingQuery.isPending,
    setOpenAssignSheet,
    true
  )

  const retryPendingMutation = useRetryPendingEmail()
  const retryingPendingId = retryPendingMutation.isPending
    ? (retryPendingMutation.variables ?? null)
    : null

  async function retryPending(message: FinancePendingEmailMessage) {
    try {
      const retryOutcome = await retryPendingMutation.mutateAsync(message.id)
      if ("assigned" in retryOutcome && retryOutcome.assigned) {
        appToast.success({ text1: "Movimiento asignado" })
        return
      }
      appToast.info({
        text1: "Sigue pendiente",
        text2: "Ábrelo para elegir cuenta o tarjeta.",
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      {queueDown ? (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlertIcon />
          <AlertTitle>Cola de sync no disponible</AlertTitle>
          <AlertDescription>
            Redis no responde. Los correos no se encolan. En desarrollo levanta
            Redis local (docker compose up -d redis) y usa
            REDIS_URL=redis://localhost:6379.
          </AlertDescription>
        </Alert>
      ) : null}
      {latestFailedLog ? (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlertIcon />
          <AlertTitle>
            Falló el último sync de {latestFailedLog.sourceName}
          </AlertTitle>
          <AlertDescription>
            {latestFailedLog.error ??
              "Revisa la conexión de Gmail y vuelve a sincronizar."}
          </AlertDescription>
        </Alert>
      ) : null}
      {errorMessage ? (
        <FinanceErrorState
          message={errorMessage}
          onRetry={() => {
            void mailboxesQuery.refetch()
            void pendingQuery.refetch()
          }}
          isRetrying={mailboxesQuery.isFetching || pendingQuery.isFetching}
        />
      ) : null}

      <SummarySection
        title="Correos"
        icon={MailIcon}
        right={
          <Button
            size="sm"
            variant="ghost"
            disabled={!enabled || !emailSyncEnabled}
            onClick={() => setOpenConnectSheet(true)}
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
        ) : emailSyncAutomatic ? (
          <p className="px-1 pb-3 text-sm text-muted-foreground">
            Sincronización automática según la frecuencia configurada. Solo se
            usa IA si hay correos nuevos.
          </p>
        ) : (
          <p className="px-1 pb-3 text-sm text-muted-foreground">
            Sincronización automática apagada. Usa el botón de recarga o
            Sincronizar ahora. Actívala en Ajustes → Finanzas.
          </p>
        )}
        <AsyncRegion
          pending={mailboxesQuery.isPending && !mailboxesQuery.data}
          pendingFallback={<FinanceListSkeleton />}
          empty={mailboxes.length === 0}
          emptyFallback={
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MailIcon />
                </EmptyMedia>
                <EmptyTitle>Aún no hay Gmail</EmptyTitle>
                <EmptyDescription>
                  Conecta Gmail (solo lectura). Después ligas cada banco con el
                  correo desde el que llegan las notificaciones.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  disabled={!emailSyncEnabled}
                  onClick={() => setOpenConnectSheet(true)}
                >
                  <PlusIcon className="size-4 shrink-0" />
                  Conectar Gmail
                </Button>
              </EmptyContent>
            </Empty>
          }
        >
          {mailboxes.map((mailbox) => (
            <MailboxGroup
              key={mailbox.id}
              mailbox={mailbox}
              institutions={institutionsQuery.data ?? []}
              emailSyncEnabled={emailSyncEnabled}
              syncingSourceId={pendingSourceId}
              onOpenMailbox={(id) => setOpenMailboxSheet(true, id)}
              onOpenSource={(id) => setOpenSourceSheet(true, id)}
              onAddInstitution={(id) => setOpenLinkSheet(true, id)}
              onSyncSource={(id) => void runSync(id)}
            />
          ))}
        </AsyncRegion>
      </SummarySection>

      <SummarySection title="Movimientos por asignar" icon={InboxIcon}>
        <AsyncRegion
          pending={pendingQuery.isPending && !pendingQuery.data}
          pendingFallback={<FinanceListSkeleton />}
          empty={pending.length === 0}
          emptyFallback={
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>Aún no hay movimientos por asignar</EmptyTitle>
                <EmptyDescription>
                  Cuando un banco envía un correo con un movimiento, se asigna
                  automáticamente.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          }
        >
          {pending.map((message, index) => (
            <PendingEmailRow
              key={message.id}
              message={message}
              display={display}
              isLast={index === pending.length - 1}
              isRetrying={retryingPendingId === message.id}
              onPress={() => setOpenAssignSheet(true, message.id)}
              onRetry={() => void retryPending(message)}
            />
          ))}
          <InfiniteListSentinel
            hasNextPage={pendingQuery.hasNextPage}
            isFetchingNextPage={pendingQuery.isFetchingNextPage}
            onLoadMore={() => void pendingQuery.fetchNextPage()}
          />
        </AsyncRegion>
      </SummarySection>

      {emailSyncEnabled ? (
        <>
          <EmailSyncLogsSection
            logs={syncLogs}
            emptyLabel="Todavía no hay runs. Sincroniza un banco para ver el historial."
          />
          <EmailMessageHistorySection
            messages={recentMessages}
            hasNextPage={messagesQuery.hasNextPage}
            isFetchingNextPage={messagesQuery.isFetchingNextPage}
            onLoadMore={() => void messagesQuery.fetchNextPage()}
          />
        </>
      ) : null}

      <ConnectGmailSheet
        open={openConnectSheet}
        onOpenChange={setOpenConnectSheet}
        emailSyncEnabled={emailSyncEnabled}
      />
      <OauthGmailResultSheet
        open={openOauthResult}
        onOpenChange={setOpenOauthResult}
      />
      <MailboxSheet
        open={openMailboxSheet}
        onOpenChange={setOpenMailboxSheet}
        pending={Boolean(mailboxSheetId) && !editingMailbox}
        mailbox={editingMailbox}
        emailSyncEnabled={emailSyncEnabled}
      />
      <EmailSourceSheet
        open={openSourceSheet}
        onOpenChange={setOpenSourceSheet}
        pending={Boolean(sourceSheetId) && !editingSource}
        source={editingSource}
        institutions={institutions}
        emailSyncEnabled={emailSyncEnabled}
      />
      <LinkInstitutionMailboxSheet
        open={openLinkSheet}
        onOpenChange={setOpenLinkSheet}
        mailboxes={mailboxes}
        institutions={institutions}
        mailboxId={linkMailboxId}
        emailSyncEnabled={emailSyncEnabled}
      />
      <AssignEmailMessageSheet
        open={openAssignSheet}
        onOpenChange={setOpenAssignSheet}
        pending={Boolean(assignSheetId) && !assigning}
        message={assigning}
        accounts={accounts}
        cards={cards}
        institutions={institutions}
        display={display}
      />
    </>
  )
}
