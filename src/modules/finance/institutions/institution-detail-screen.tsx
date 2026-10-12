"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import {
  AccountProductRow,
  CardProductRow,
} from "@/src/modules/finance/shared/components/product-rows"
import { InstitutionProductEmpty } from "@/src/modules/finance/institutions/components/institution-product-lists"
import { AccountSheet, CardBalanceSheet } from "@/src/modules/finance/catalog"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { LoanProgressCard } from "@/src/modules/finance/loans"
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
import { DeleteRecordDialog } from "@/src/modules/finance/shared/components/delete-record-dialog"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
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
      appToast.success({ text1: "Institución eliminada" })
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
                  onCreate={() =>
                    router.push(
                      `${APP_ROUTES.app.financeCardNew}?institutionId=${institutionId}`
                    )
                  }
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
                  onCreate={() =>
                    router.push(
                      `${APP_ROUTES.app.financeLoanNew}?institutionId=${institutionId}`
                    )
                  }
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

      <RecordOptionsSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        description={institution.name}
        options={[
          {
            id: "edit",
            title: "Editar institución",
            icon: PencilIcon,
            onPress: () => {
              setOpenOptionsSheet(false)
              router.push(APP_ROUTES.app.financeInstitutionEdit(institution.id))
            },
          },
          {
            id: "new-account",
            title: "Nueva cuenta",
            icon: LandmarkIcon,
            onPress: () => {
              setOpenOptionsSheet(false)
              setOpenAccountSheet(true, null)
            },
          },
          {
            id: "new-card",
            title: "Nueva tarjeta",
            icon: CreditCardIcon,
            onPress: () => {
              setOpenOptionsSheet(false)
              router.push(
                `${APP_ROUTES.app.financeCardNew}?institutionId=${institutionId}`
              )
            },
          },
          {
            id: "new-loan",
            title: "Nuevo préstamo",
            icon: HandCoinsIcon,
            onPress: () => {
              setOpenOptionsSheet(false)
              router.push(
                `${APP_ROUTES.app.financeLoanNew}?institutionId=${institutionId}`
              )
            },
          },
          {
            id: "link-mailbox",
            title: "Vincular correo",
            description: linkedMailbox
              ? `Conectada a ${linkedMailbox.emailAddress}`
              : "Liga un Gmail ya conectado",
            icon: MailIcon,
            disabled: Boolean(linkedMailbox),
            showChevron: !linkedMailbox,
            onPress: () => setOpenLinkSheet(true),
          },
          ...(linkedSource
            ? [
                {
                  id: "sync-mailbox",
                  title: "Sincronizar correo",
                  description: emailSyncEnabled
                    ? "Leer transacciones nuevas del banco"
                    : "Actívala en Ajustes → Finanzas",
                  icon: RefreshCwIcon,
                  disabled: !emailSyncEnabled || syncPending,
                  showChevron: false,
                  onPress: () => void runSync(linkedSource.id),
                },
              ]
            : []),
          {
            id: "archive",
            title: "Archivar",
            icon: ArchiveIcon,
            disabled:
              archiveInstitution.isPending || deleteInstitution.isPending,
            onPress: () => void onArchiveInstitution(),
          },
          {
            id: "delete",
            title: "Eliminar",
            icon: Trash2Icon,
            destructive: true,
            disabled:
              archiveInstitution.isPending || deleteInstitution.isPending,
            onPress: () => setConfirmOpen(true),
          },
        ]}
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

      <AccountSheet
        open={openAccountSheet}
        onOpenChange={setOpenAccountSheet}
        pending={Boolean(accountSheetId) && !editingAccount}
        account={editingAccount}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
        defaultInstitutionId={institutionId}
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
