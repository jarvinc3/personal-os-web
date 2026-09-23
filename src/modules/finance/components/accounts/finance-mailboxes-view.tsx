"use client"

import { AssignEmailMessageSheet } from "@/src/modules/finance/components/sync/assign-email-message-sheet"
import { ConnectGmailSheet } from "@/src/modules/finance/components/sync/connect-gmail-sheet"
import { EmailSourceSheet } from "@/src/modules/finance/components/sync/email-source-sheet"
import { LinkInstitutionMailboxSheet } from "@/src/modules/finance/components/sync/link-institution-mailbox-sheet"
import { MailboxGroup } from "@/src/modules/finance/components/sync/mailbox-group"
import { MailboxSheet } from "@/src/modules/finance/components/sync/mailbox-sheet"
import { OauthGmailResultSheet } from "@/src/modules/finance/components/sync/oauth-gmail-result-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import {
  useEmailMailboxes,
  usePendingEmailMessages,
  useRunEmailSync,
} from "@/src/modules/finance/hooks/use-email-sources"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions"
import { useSheetListEntity } from "@/src/modules/finance/hooks/use-sheet-entity"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/lib/money"
import type { FinancePendingEmailMessage } from "@/src/modules/finance/types/entities"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { FinanceListSkeleton } from "@/src/modules/finance/components/layout/finance-list-skeleton"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { InboxIcon, MailIcon, PlusIcon } from "lucide-react"

function pendingRowValue(
  message: FinancePendingEmailMessage,
  display: FinanceMoneyDisplay,
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
  return `${message.institutionName} · ${amount}`
}

export function FinanceMailboxesView({ enabled }: { enabled: boolean }) {
  const { emailSyncEnabled, config } = useFinanceEnabled()
  const { run: runSync, pendingSourceId } = useRunEmailSync(emailSyncEnabled)
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }
  const { open: openConnectSheet, setOpen: setOpenConnectSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.connectGmail)
  const { open: openOauthResult, setOpen: setOpenOauthResult } = useSheetParam(
    FINANCE_SHEET_KEYS.oauthGmailResult,
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

  const institutions = institutionsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const mailboxes = mailboxesQuery.data ?? []
  const pending = pendingQuery.data ?? []
  const sources = mailboxes.flatMap((mailbox) => mailbox.sources)

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
    true,
  )
  const editingSource = useSheetListEntity(
    openSourceSheet,
    sourceSheetId,
    sources,
    mailboxesQuery.isPending,
    setOpenSourceSheet,
    true,
  )
  const assigning = useSheetListEntity(
    openAssignSheet,
    assignSheetId,
    pendingQuery.data,
    pendingQuery.isPending,
    setOpenAssignSheet,
    true,
  )

  return (
    <>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <SummarySection title="Movimientos por asignar" icon={InboxIcon}>
        {pendingQuery.isPending && !pendingQuery.data ? (
          <FinanceListSkeleton />
        ) : pending.length === 0 ? (
          <p className="px-1 py-2 text-sm text-muted-foreground">
            No hay correos pendientes de cuenta o tarjeta.
          </p>
        ) : (
          pending.map((message, index) => (
            <SummaryItem
              key={message.id}
              title={
                message.extractedPayload?.merchant ?? message.gmailMessageId
              }
              value={pendingRowValue(message, display)}
              icon={InboxIcon}
              onPress={() => setOpenAssignSheet(true, message.id)}
              isLast={index === pending.length - 1}
            />
          ))
        )}
      </SummarySection>

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
        ) : (
          <p className="px-1 pb-3 text-sm text-muted-foreground">
            Los bancos se leen solos cada 6 horas. Solo se usa IA si hay correos
            nuevos.
          </p>
        )}
        {mailboxesQuery.isPending && !mailboxesQuery.data ? (
          <FinanceListSkeleton />
        ) : mailboxes.length === 0 ? (
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
                Conectar Gmail
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          mailboxes.map((mailbox) => (
            <MailboxGroup
              key={mailbox.id}
              mailbox={mailbox}
              emailSyncEnabled={emailSyncEnabled}
              syncingSourceId={pendingSourceId}
              onOpenMailbox={(id) => setOpenMailboxSheet(true, id)}
              onOpenSource={(id) => setOpenSourceSheet(true, id)}
              onAddInstitution={(id) => setOpenLinkSheet(true, id)}
              onSyncSource={(id) => void runSync(id)}
            />
          ))
        )}
      </SummarySection>

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
        display={display}
      />
    </>
  )
}
