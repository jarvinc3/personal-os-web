"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import {
  AccountProductRow,
  CardProductRow,
} from "@/src/modules/finance/shared/components/product-rows"
import { InstitutionProductEmpty } from "@/src/modules/finance/institutions/components/institution-product-lists"
import { InstitutionSheet } from "@/src/modules/finance/institutions/components/institution-sheet"
import {
  AccountSheet,
  CardBalanceSheet,
  CardSheet,
} from "@/src/modules/finance/catalog"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { LoanProgressCard, LoanSheet } from "@/src/modules/finance/loans"
import { LinkInstitutionMailboxSheet } from "@/src/modules/finance/sync"
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
} from "@/src/modules/finance/shared/hooks/use-institutions"
import { useLoans } from "@/src/modules/finance/shared/hooks/use-loans"
import { useSheetListEntity } from "@/src/modules/finance/shared/hooks/use-sheet-entity"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import {
  buildInstitutionStackItems,
  formatStackItemBalance,
} from "@/src/modules/finance/shared/lib/institution-stack"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ArchiveIcon,
  Building2Icon,
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  MailIcon,
  MoreVerticalIcon,
  PencilIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { ProductCountItem } from "@/src/modules/finance/products"
import { Label } from "@/src/shared/components/ui/label"

const FALLBACK_COLOR = "#1B4332"

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

  const [tab, setTab] = useState<"accounts" | "cards" | "loans">("accounts")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.institutionOptions)
  const {
    open: openInstitutionSheet,
    sheetId: institutionSheetId,
    setOpen: setOpenInstitutionSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.institution)
  const {
    open: openAccountSheet,
    sheetId: accountSheetId,
    setOpen: setOpenAccountSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.account)
  const {
    open: openCardSheet,
    sheetId: cardSheetId,
    setOpen: setOpenCardSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.card)
  const {
    open: openCardBalanceSheet,
    sheetId: cardBalanceSheetId,
    setOpen: setOpenCardBalanceSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.cardBalance)
  const {
    open: openLoanSheet,
    sheetId: loanSheetId,
    setOpen: setOpenLoanSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.loan)
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
    institutionId,
  ])

  const institution =
    stackItem?.kind === "institution"
      ? stackItem.institution
      : (institutions.find((item) => item.id === institutionId) ?? null)

  const accent = institution?.color ?? FALLBACK_COLOR

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

  const onArchiveInstitution = useCallback(async () => {
    if (!institution) {
      return
    }
    try {
      await archiveInstitution.mutateAsync(institution.id)
      appToast.success({ text1: "Institución archivada" })
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeProducts)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }, [archiveInstitution, institution, router, setOpenOptionsSheet])

  const onDeleteInstitution = useCallback(async () => {
    if (!institution) {
      return
    }
    try {
      await deleteInstitution.mutateAsync(institution.id)
      appToast.success({ text1: "Institución borrada" })
      setConfirmOpen(false)
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeProducts)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }, [
    deleteInstitution,
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
      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        aria-label="Opciones de la institución"
        onClick={openMenu}
      >
        <MoreVerticalIcon className="size-4.5" />
      </Button>
    ),
    [openMenu]
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

  const editingInstitution = useSheetListEntity(
    openInstitutionSheet,
    institutionSheetId,
    institutionsQuery.data,
    institutionsQuery.isPending,
    setOpenInstitutionSheet
  )
  const editingAccount = useSheetListEntity(
    openAccountSheet,
    accountSheetId,
    accountsQuery.data,
    accountsQuery.isPending,
    setOpenAccountSheet
  )
  const editingCard = useSheetListEntity(
    openCardSheet,
    cardSheetId,
    cardsQuery.data,
    cardsQuery.isPending,
    setOpenCardSheet
  )
  const balancingCard = useSheetListEntity(
    openCardBalanceSheet,
    cardBalanceSheetId,
    cardsQuery.data,
    cardsQuery.isPending,
    setOpenCardBalanceSheet,
    true
  )
  const editingLoan = useSheetListEntity(
    openLoanSheet,
    loanSheetId,
    loansQuery.data,
    loansQuery.isPending,
    setOpenLoanSheet
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
  const institutionAccounts =
    stackItem?.kind === "institution" ? stackItem.accounts : []
  const institutionCards =
    stackItem?.kind === "institution" ? stackItem.cards : []
  const institutionLoans =
    stackItem?.kind === "institution" ? stackItem.loans : []

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
        <div
          className="rounded-b-3xl p-4 text-white md:p-6"
          style={{
            background: accent,
          }}
        >
          <div className="flex items-center gap-3">
            <BrandLogo
              name={institution.name}
              logoUrl={institution.logoUrl}
              size={48}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {institution.name}
              </h1>
              <div className="flex items-center gap-3 text-base font-semibold text-white tabular-nums">
                <ProductCountItem
                  icon={LandmarkIcon}
                  count={counts.accounts}
                  label="Cuentas"
                />
                <span className="h-4 w-px bg-white/40" />
                <ProductCountItem
                  icon={CreditCardIcon}
                  count={counts.cards}
                  label="Tarjetas"
                />
                <span className="h-4 w-px bg-white/40" />
                <ProductCountItem
                  icon={HandCoinsIcon}
                  count={counts.loans}
                  label="Préstamos"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-1 rounded-2xl bg-black/20 px-3 py-2">
            <Label className="text-sm text-foreground">Saldo</Label>
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {formatStackItemBalance(stackItem!, moneyDisplay)}
            </p>
          </div>

          {incompleteCard ? (
            <Button
              type="button"
              variant="secondary"
              className="mt-4 bg-white/15 text-white hover:bg-white/25"
              onClick={() => setOpenCardBalanceSheet(true, incompleteCard.id)}
            >
              <PencilIcon className="size-4 shrink-0" />
              Completar límite de {incompleteCard.name}
            </Button>
          ) : null}
        </div>

        <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
          <Tabs
            className="flex w-full flex-col gap-4 p-1.5"
            value={tab}
            onValueChange={setTab}
          >
            <TabsList className="w-full rounded-2xl bg-background">
              <TabsTrigger value="accounts" className="rounded-2xl py-4">
                <LandmarkIcon className="size-4 shrink-0" />
                Cuentas
              </TabsTrigger>
              <TabsTrigger value="cards" className="rounded-2xl py-4">
                <CreditCardIcon className="size-4 shrink-0" />
                Tarjetas
              </TabsTrigger>
              <TabsTrigger value="loans" className="rounded-2xl py-4">
                <HandCoinsIcon className="size-4 shrink-0" />
                Préstamos
              </TabsTrigger>
            </TabsList>

            {/* Panels are rendered by the parent for layout control */}
            <TabsContent value="accounts" className="flex flex-col gap-3">
              {institutionAccounts.length === 0 ? (
                <InstitutionProductEmpty
                  tab="accounts"
                  onCreate={() => setOpenAccountSheet(true, null)}
                />
              ) : (
                institutionAccounts.map((account) => (
                  <AccountProductRow
                    key={account.id}
                    account={account}
                    display={display}
                    onPress={() =>
                      router.push(
                        APP_ROUTES.app.financeInstitutionAccount(
                          institutionId,
                          account.id
                        )
                      )
                    }
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="cards" className="flex flex-col gap-3">
              {institutionCards.length === 0 ? (
                <InstitutionProductEmpty
                  tab="cards"
                  onCreate={() => setOpenCardSheet(true, null)}
                />
              ) : (
                institutionCards.map((card) => (
                  <CardProductRow
                    key={card.id}
                    card={card}
                    accounts={accounts}
                    display={display}
                    onPress={() =>
                      card.type === "DEBIT" && card.accountId
                        ? router.push(
                            APP_ROUTES.app.financeInstitutionAccount(
                              institutionId,
                              card.accountId
                            )
                          )
                        : router.push(
                            APP_ROUTES.app.financeInstitutionCard(
                              institutionId,
                              card.id
                            )
                          )
                    }
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="loans" className="flex flex-col gap-3">
              {institutionLoans.length === 0 ? (
                <InstitutionProductEmpty
                  tab="loans"
                  onCreate={() => setOpenLoanSheet(true, null)}
                />
              ) : (
                institutionLoans.map((loan) => (
                  <LoanProgressCard
                    key={loan.id}
                    loan={loan}
                    display={display}
                    institution={institution}
                    onPress={() =>
                      router.push(APP_ROUTES.app.financeLoan(loan.id))
                    }
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        title="Opciones"
        description={institution.name}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-1">
          <SummaryItem
            title="Editar institución"
            icon={PencilIcon}
            onPress={() => setOpenInstitutionSheet(true, institution.id)}
            className="px-3"
          />
          <SummaryItem
            title="Nueva cuenta"
            icon={LandmarkIcon}
            onPress={() => setOpenAccountSheet(true, null)}
            className="px-3"
          />
          <SummaryItem
            title="Nueva tarjeta"
            icon={CreditCardIcon}
            onPress={() => setOpenCardSheet(true, null)}
            className="px-3"
          />
          <SummaryItem
            title="Nuevo préstamo"
            icon={HandCoinsIcon}
            onPress={() => setOpenLoanSheet(true, null)}
            className="px-3"
          />
          <SummaryItem
            title="Vincular correo"
            description={
              linkedMailbox
                ? `Conectada a ${linkedMailbox.emailAddress}`
                : "Liga un Gmail ya conectado"
            }
            icon={MailIcon}
            disabled={Boolean(linkedMailbox)}
            onPress={linkedMailbox ? undefined : () => setOpenLinkSheet(true)}
            showChevron={!linkedMailbox}
            isLast={false}
            className="px-3"
          />
          {linkedSource ? (
            <SummaryItem
              title="Sincronizar correo"
              description={
                emailSyncEnabled
                  ? "Leer transacciones nuevas del banco"
                  : "Actívala en Ajustes → Finanzas"
              }
              icon={RefreshCwIcon}
              disabled={!emailSyncEnabled || syncPending}
              onPress={() => void runSync(linkedSource.id)}
              showChevron={false}
              isLast={false}
              className="px-3"
            />
          ) : null}
          <SummaryItem
            title="Archivar"
            icon={ArchiveIcon}
            onPress={() => void onArchiveInstitution()}
            disabled={
              archiveInstitution.isPending || deleteInstitution.isPending
            }
            isLast={false}
            className="px-3 text-destructive"
          />
          <SummaryItem
            title="Borrar"
            icon={Trash2Icon}
            onPress={() => setConfirmOpen(true)}
            disabled={
              archiveInstitution.isPending || deleteInstitution.isPending
            }
            isLast
            className="px-3 text-destructive"
          />
        </div>
      </BottomSheet>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!deleteInstitution.isPending) {
            setConfirmOpen(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar este banco?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminan cuentas, tarjetas, correos ligados y préstamos. No se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteInstitution.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteInstitution.isPending}
              onClick={() => void onDeleteInstitution()}
            >
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InstitutionSheet
        open={openInstitutionSheet}
        onOpenChange={setOpenInstitutionSheet}
        pending={Boolean(institutionSheetId) && !editingInstitution}
        institution={
          editingInstitution ?? (!institutionSheetId ? institution : null)
        }
        onDeleted={() => router.push(APP_ROUTES.app.financeProducts)}
      />

      <AccountSheet
        open={openAccountSheet}
        onOpenChange={setOpenAccountSheet}
        pending={Boolean(accountSheetId) && !editingAccount}
        account={editingAccount}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
        display={display}
        defaultInstitutionId={institutionId}
      />

      <CardSheet
        open={openCardSheet}
        onOpenChange={setOpenCardSheet}
        pending={Boolean(cardSheetId) && !editingCard}
        card={editingCard}
        institutions={institutions}
        accounts={accounts}
        defaultCurrency={config.baseCurrency}
        defaultInstitutionId={institutionId}
        onUpdateBalance={(item) => setOpenCardBalanceSheet(true, item.id)}
      />

      <CardBalanceSheet
        open={openCardBalanceSheet}
        onOpenChange={setOpenCardBalanceSheet}
        pending={Boolean(cardBalanceSheetId) && !balancingCard}
        card={balancingCard}
        defaultCurrency={config.baseCurrency}
        display={display}
      />

      <LoanSheet
        open={openLoanSheet}
        onOpenChange={setOpenLoanSheet}
        pending={Boolean(loanSheetId) && !editingLoan}
        loan={editingLoan}
        accounts={accounts}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
        defaultInstitutionId={institutionId}
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
