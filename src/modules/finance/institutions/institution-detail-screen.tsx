"use client"

import { AccountSheet, CardBalanceSheet } from "@/src/modules/finance/catalog"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { InstitutionDetailHero } from "@/src/modules/finance/institutions/components/institution-detail-hero"
import { buildInstitutionOptions } from "@/src/modules/finance/institutions/components/institution-options"
import {
  InstitutionProductTabs,
  type InstitutionProductTab,
} from "@/src/modules/finance/institutions/components/institution-product-tabs"
import { LinkInstitutionMailboxSheet } from "@/src/modules/finance/sync"
import { ArchiveRecordDialog } from "@/src/modules/finance/shared/components/archive-record-dialog"
import { DeleteRecordDialog } from "@/src/modules/finance/shared/components/delete-record-dialog"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useBalanceSheet } from "@/src/modules/finance/shared/hooks/use-balance-sheet"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import {
  useEmailMailboxes,
  useRunEmailSync,
} from "@/src/modules/finance/shared/hooks/use-email-sources"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useArchiveInstitution,
  useDeleteInstitution,
  useInstitutions,
  useRestoreInstitution,
  useUnarchiveInstitution,
} from "@/src/modules/finance/shared/hooks/use-institutions"
import { useLoans } from "@/src/modules/finance/shared/hooks/use-loans"
import { useSheetListEntity } from "@/src/modules/finance/shared/hooks/use-sheet-entity"
import { isCashInstitution } from "@/src/modules/finance/shared/lib/cash"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import {
  buildInstitutionStackItems,
  formatStackItemBalance,
} from "@/src/modules/finance/shared/lib/institution-stack"
import { ChatLauncherButton, useRegisterChatContext } from "@/src/modules/ai"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import { Building2Icon, MoreVerticalIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

const FALLBACK_COLOR = "#1B4332"
const INCOMPLETE_BALANCE_TEXT = "Balance incompleto"

type InstitutionDetailScreenProps = {
  institutionId: string
}

export function InstitutionDetailScreen({
  institutionId,
}: InstitutionDetailScreenProps) {
  return (
    <FinanceGate>
      <InstitutionDetailScreenBody institutionId={institutionId} />
    </FinanceGate>
  )
}

function InstitutionDetailScreenBody({
  institutionId,
}: InstitutionDetailScreenProps) {
  const router = useRouter()
  const { isEnabled, config, emailSyncEnabled } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const institutionsQuery = useInstitutions(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const cardsQuery = useCards(isEnabled)
  const loansQuery = useLoans(isEnabled)
  const balanceSheetQuery = useBalanceSheet(isEnabled)
  const mailboxesQuery = useEmailMailboxes(isEnabled && emailSyncEnabled)
  const { run: runSync, isPending: syncPending } =
    useRunEmailSync(emailSyncEnabled)
  const archiveInstitution = useArchiveInstitution()
  const deleteInstitution = useDeleteInstitution()
  const restoreInstitution = useRestoreInstitution()
  const unarchiveInstitution = useUnarchiveInstitution()

  const [tab, setTab] = useState<InstitutionProductTab>("accounts")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.institutionOptions)
  const {
    open: openAccountSheet,
    sheetId: accountSheetId,
    setOpen: setOpenAccountSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.account)
  const {
    open: openCardBalanceSheet,
    sheetId: cardBalanceSheetId,
    setOpen: setOpenCardBalanceSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.cardBalance)
  const { open: openLinkSheet, setOpen: setOpenLinkSheet } = useSheetParam(
    FINANCE_SHEET_KEYS.linkInstitutionMailbox
  )

  const institutions = institutionsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const mailboxes = mailboxesQuery.data ?? []
  const linkedSource =
    mailboxes
      .flatMap((mailbox) => mailbox.sources)
      .find(
        (source) => source.isActive && source.institutionId === institutionId
      ) ?? null
  const linkedMailbox = linkedSource
    ? (mailboxes.find((mailbox) => mailbox.id === linkedSource.connectionId) ??
      mailboxes.find((mailbox) =>
        mailbox.sources.some((source) => source.id === linkedSource.id)
      ) ??
      null)
    : null

  const moneyDisplay = {
    ...display,
    currency: balanceSheetQuery.data?.baseCurrency ?? display.currency,
  }

  const stackItem = useMemo(() => {
    const items = buildInstitutionStackItems({
      institutions: institutionsQuery.data ?? [],
      accounts: accountsQuery.data ?? [],
      cards: cardsQuery.data ?? [],
      loans: loansQuery.data ?? [],
      positions: balanceSheetQuery.data?.institutions,
      cash: balanceSheetQuery.data?.cash,
    })
    return items.find(
      (item) => item.kind === "institution" && item.id === institutionId
    )
  }, [
    institutionsQuery.data,
    accountsQuery.data,
    cardsQuery.data,
    loansQuery.data,
    balanceSheetQuery.data?.institutions,
    balanceSheetQuery.data?.cash,
    institutionId,
  ])

  const institution =
    stackItem?.kind === "institution"
      ? stackItem.institution
      : (institutions.find((item) => item.id === institutionId) ?? null)

  const accent = institution?.color ?? FALLBACK_COLOR
  const isCash = institution ? isCashInstitution(institution) : false

  useRegisterChatContext(
    institution
      ? {
          moduleSlug: "finance",
          screen: "institution-detail",
          entityRef: { type: "institution", id: institution.id },
          entityLabel: institution.name,
        }
      : null
  )

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

  const onArchiveInstitution = useCallback(async () => {
    if (!institution) {
      return
    }
    try {
      const institutionId = institution.id
      await archiveInstitution.mutateAsync(institutionId)
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeProducts)
      showUndoToast("Institución archivada", () =>
        unarchiveInstitution.mutate(institutionId, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }, [
    archiveInstitution,
    unarchiveInstitution,
    institution,
    router,
    setOpenOptionsSheet,
  ])

  const onDeleteInstitution = useCallback(async () => {
    if (!institution) {
      return
    }
    try {
      const institutionId = institution.id
      await deleteInstitution.mutateAsync(institutionId)
      setConfirmOpen(false)
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeProducts)
      showUndoToast("Institución eliminada", () =>
        restoreInstitution.mutate(institutionId, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }, [
    deleteInstitution,
    restoreInstitution,
    institution,
    router,
    setConfirmOpen,
    setOpenOptionsSheet,
  ])

  const openMenu = useCallback(
    () => setOpenOptionsSheet(true),
    [setOpenOptionsSheet]
  )

  const headerActions = useMemo(
    () => (
      <>
        <ChatLauncherButton />
        {!isCash ? (
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
            aria-label="Opciones de la institución"
            onClick={openMenu}
          >
            <MoreVerticalIcon className="size-4.5" />
          </Button>
        ) : null}
      </>
    ),
    [openMenu, isCash]
  )

  usePageHeader(
    {
      variant: "secondary",
      title: "Detalles de la institución",
      onBack: handleBack,
      actions: headerActions,
      accentColor: accent,
    },
    [handleBack, institution?.id, institution?.name, accent, headerActions]
  )

  const isLoading =
    institutionsQuery.isPending ||
    accountsQuery.isPending ||
    cardsQuery.isPending ||
    loansQuery.isPending ||
    (balanceSheetQuery.isPending && !balanceSheetQuery.data)

  const error =
    institutionsQuery.error ??
    accountsQuery.error ??
    cardsQuery.error ??
    loansQuery.error ??
    balanceSheetQuery.error

  const editingAccount = useSheetListEntity(
    openAccountSheet,
    accountSheetId,
    accountsQuery.data,
    accountsQuery.isPending,
    setOpenAccountSheet
  )
  const balancingCard = useSheetListEntity(
    openCardBalanceSheet,
    cardBalanceSheetId,
    cardsQuery.data,
    cardsQuery.isPending,
    setOpenCardBalanceSheet,
    true
  )

  if (isLoading && !institution) {
    return <LoadingView />
  }

  if (!institution) {
    return (
      <MissingRecord
        icon={Building2Icon}
        title="No encontramos esta institución"
        description="Puede que se haya archivado o borrado."
        backHref={APP_ROUTES.app.financeProducts}
        backLabel="Volver a Productos"
      />
    )
  }

  const counts =
    stackItem?.kind === "institution"
      ? stackItem.counts
      : { accounts: 0, cards: 0, loans: 0 }
  const incompleteIssue =
    stackItem?.kind === "institution"
      ? stackItem.issues.find((issue) => issue.code === "MISSING_CREDIT_LIMIT")
      : undefined
  const incompleteCard = incompleteIssue
    ? (cardsQuery.data ?? []).find((card) => card.id === incompleteIssue.cardId)
    : undefined
  const products = {
    accounts: stackItem?.kind === "institution" ? stackItem.accounts : [],
    cards: stackItem?.kind === "institution" ? stackItem.cards : [],
    loans: stackItem?.kind === "institution" ? stackItem.loans : [],
  }
  const cash = stackItem?.kind === "institution" ? stackItem.cash : null
  const balanceText = stackItem
    ? formatStackItemBalance(stackItem, moneyDisplay)
    : INCOMPLETE_BALANCE_TEXT
  const isBusy = archiveInstitution.isPending || deleteInstitution.isPending

  const options = buildInstitutionOptions({
    linkedMailboxEmail: linkedMailbox?.emailAddress ?? null,
    hasLinkedSource: Boolean(linkedSource),
    emailSyncEnabled,
    syncPending,
    busy: isBusy,
    onEdit: () =>
      router.push(APP_ROUTES.app.financeInstitutionEdit(institutionId)),
    onNewAccount: () => setOpenAccountSheet(true, null),
    onNewCard: () =>
      router.push(
        `${APP_ROUTES.app.financeCardNew}?institutionId=${institutionId}`
      ),
    onNewLoan: () =>
      router.push(
        `${APP_ROUTES.app.financeLoanNew}?institutionId=${institutionId}`
      ),
    onLinkMailbox: () => setOpenLinkSheet(true),
    onSyncMailbox: () => {
      if (!linkedSource) {
        return
      }
      void runSync(linkedSource.id)
    },
    onArchive: () => setArchiveConfirmOpen(true),
    onDelete: () => setConfirmOpen(true),
  })

  return (
    <>
      {error ? (
        <div className="mb-3">
          <FinanceErrorState
            message={financeLoadErrorMessage(error)}
            onRetry={() => {
              void institutionsQuery.refetch()
              void accountsQuery.refetch()
              void cardsQuery.refetch()
              void loansQuery.refetch()
              void balanceSheetQuery.refetch()
            }}
            isRetrying={
              institutionsQuery.isFetching ||
              accountsQuery.isFetching ||
              cardsQuery.isFetching ||
              loansQuery.isFetching ||
              balanceSheetQuery.isFetching
            }
          />
        </div>
      ) : null}

      <div className="-mx-4 -mt-4 flex flex-col gap-3 overflow-hidden md:-mx-6">
        <InstitutionDetailHero
          institution={institution}
          accent={accent}
          isCash={isCash}
          counts={counts}
          balanceText={balanceText}
          incompleteCardName={incompleteCard?.name ?? null}
          onCompleteLimit={() => {
            if (!incompleteCard) {
              return
            }
            setOpenCardBalanceSheet(true, incompleteCard.id)
          }}
        />

        <InstitutionProductTabs
          tab={tab}
          onTabChange={setTab}
          institution={institution}
          isCash={isCash}
          cash={cash}
          products={products}
          allAccounts={accounts}
          display={display}
          onCreate={{
            account: () => setOpenAccountSheet(true, null),
            card: () =>
              router.push(
                `${APP_ROUTES.app.financeCardNew}?institutionId=${institutionId}`
              ),
            loan: () =>
              router.push(
                `${APP_ROUTES.app.financeLoanNew}?institutionId=${institutionId}`
              ),
          }}
        />
      </div>

      <RecordOptionsSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        description={institution.name}
        options={options}
      />

      <DeleteRecordDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        recordName={institution.name}
        pending={deleteInstitution.isPending}
        consequences="Se eliminan cuentas, tarjetas, correos ligados y préstamos. No se puede deshacer."
        onConfirm={() => void onDeleteInstitution()}
        archive={{
          label: "¿Solo ocultarla? Archivar",
          pending: archiveInstitution.isPending,
          onArchive: () => void onArchiveInstitution(),
        }}
      />

      <ArchiveRecordDialog
        open={archiveConfirmOpen}
        onOpenChange={setArchiveConfirmOpen}
        recordName={institution.name}
        pending={archiveInstitution.isPending}
        onConfirm={() => void onArchiveInstitution()}
      />

      <AccountSheet
        open={openAccountSheet}
        onOpenChange={setOpenAccountSheet}
        pending={Boolean(accountSheetId) && !editingAccount}
        account={editingAccount}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
        defaultInstitutionId={institutionId}
        defaultType={isCash ? "CASH" : "CHECKING"}
        lockType={isCash}
        cash={balanceSheetQuery.data?.cash}
      />

      <CardBalanceSheet
        open={openCardBalanceSheet}
        onOpenChange={setOpenCardBalanceSheet}
        pending={Boolean(cardBalanceSheetId) && !balancingCard}
        card={balancingCard}
        defaultCurrency={config.baseCurrency}
        display={display}
      />

      <LinkInstitutionMailboxSheet
        open={openLinkSheet}
        onOpenChange={setOpenLinkSheet}
        mailboxes={mailboxes}
        institutions={institutions}
        institutionId={institutionId}
        emailSyncEnabled={emailSyncEnabled}
      />
    </>
  )
}
