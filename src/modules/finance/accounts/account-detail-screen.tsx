"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { DetailHeader } from "@/src/modules/finance/shared/components/layout/progress-hero"
import { GlossaryHelpButton } from "@/src/modules/help"
import {
  AccountBalanceSheet,
  AccountSheet,
} from "@/src/modules/finance/catalog"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceInstrumentMovements } from "@/src/modules/finance/transactions"
import {
  ReconciliationSheet,
  ReconciliationsSection,
} from "@/src/modules/finance/reconciliation"
import { IrregularitiesSection } from "@/src/modules/finance/integrity"
import {
  findProductDrifts,
  recalculationPayload,
} from "@/src/modules/finance/shared/lib/integrity"
import {
  useFinanceIntegrity,
  useRecalculateBalance,
} from "@/src/modules/finance/shared/hooks/use-integrity"
import { useReconciliationStatus } from "@/src/modules/finance/shared/hooks/use-reconciliations"
import { StatementImportButton } from "@/src/modules/finance/shared/components/statement-import-button"
import { FINANCE_ACCOUNT_TYPE_LABEL } from "@/src/modules/finance/shared/constants/catalog"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import {
  useAccounts,
  useArchiveAccount,
  useDeleteAccount,
  useRestoreAccount,
  useUnarchiveAccount,
} from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { allTransactionsQueryOptions } from "@/src/modules/finance/shared/hooks/use-transactions"
import { useUserTimeZone } from "@/src/modules/settings/hooks/use-user-time-zone"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import { encodeLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  isoMonthBounds,
  monthKeyFromDate,
} from "@/src/modules/finance/shared/lib/month-window"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { shortMonthLabel } from "@/src/shared/lib/date-format"
import {
  visibleTransactionTotals,
  mergeTransactionsById,
} from "@/src/modules/finance/shared/lib/transactions-query"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { InstrumentHistorySheet } from "@/src/modules/finance/shared/components/instrument-history-sheet"
import { Button } from "@/src/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  APP_ROUTES,
  financeTransactionNewHref,
} from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  ArchiveIcon,
  HistoryIcon,
  LandmarkIcon,
  MoreVerticalIcon,
  PencilIcon,
  ScaleIcon,
  Trash2Icon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useQueries } from "@tanstack/react-query"
import { useState } from "react"
import { Label } from "@/src/shared/components/ui/label"

const FALLBACK_COLOR = "#334155"

type AccountDetailScreenProps = {
  accountId: string
}

export function AccountDetailScreen({ accountId }: AccountDetailScreenProps) {
  return (
    <FinanceGate>
      <AccountDetailScreenBody accountId={accountId} />
    </FinanceGate>
  )
}

function AccountDetailScreenBody({ accountId }: AccountDetailScreenProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  const accountsQuery = useAccounts(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const cardsQuery = useCards(isEnabled)
  const integrityQuery = useFinanceIntegrity(isEnabled, { accountId })
  const recalculateBalance = useRecalculateBalance()
  const archiveAccount = useArchiveAccount()
  const deleteAccount = useDeleteAccount()
  const restoreAccount = useRestoreAccount()
  const unarchiveAccount = useUnarchiveAccount()
  const { open: openAccountSheet, setOpen: setOpenAccountSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.account)
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.cashAccountOptions)
  const { open: openBalanceSheet, setOpen: setOpenBalanceSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.accountBalance)
  const { open: openHistorySheet, setOpen: setOpenHistorySheet } =
    useSheetParam(FINANCE_SHEET_KEYS.accountHistory)
  const { open: openReconciliationSheet, setOpen: setOpenReconciliationSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.accountReconciliation)

  const account =
    (accountsQuery.data ?? []).find((item) => item.id === accountId) ?? null
  const institutions = institutionsQuery.data ?? []
  const debitCards = (cardsQuery.data ?? []).filter(
    (item) => item.type === "DEBIT" && item.accountId === accountId
  )
  const movementSources = [
    { accountId },
    ...debitCards.map((item) => ({ cardId: item.id })),
  ]
  const accent = account?.color ?? FALLBACK_COLOR

  const today = new Date()
  const monthChip =
    `${shortMonthLabel(today, formatLocale)} ${today.getFullYear()}`.toUpperCase()
  const monthBounds = isoMonthBounds(today.getFullYear(), today.getMonth() + 1)
  const timeZone = useUserTimeZone()
  const monthQueries = useQueries({
    queries: movementSources.map((source) => ({
      ...allTransactionsQueryOptions({ ...monthBounds, ...source }, timeZone),
      enabled: isEnabled,
    })),
  })
  const accountDisplay = {
    ...display,
    currency: account?.currency ?? display.currency,
  }
  const monthTotals = visibleTransactionTotals(
    mergeTransactionsById(monthQueries.map((query) => query.data ?? [])),
    accountDisplay.currency
  )
  const accountDrifts = findProductDrifts(integrityQuery.data?.drifts ?? [], {
    accountId,
  })
  const reconciliationStatusQuery = useReconciliationStatus(
    isEnabled,
    monthKeyFromDate(new Date())
  )
  const accountReconciliations = (
    reconciliationStatusQuery.data?.items ?? []
  ).filter((item) => item.kind === "account" && item.accountId === accountId)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)

  async function onArchiveAccount() {
    if (!account) {
      return
    }
    try {
      const accountId = account.id
      await archiveAccount.mutateAsync(accountId)
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeProducts)
      showUndoToast("Cuenta archivada", () =>
        unarchiveAccount.mutate(accountId, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDeleteAccount() {
    if (!account) {
      return
    }
    try {
      const accountId = account.id
      await deleteAccount.mutateAsync(accountId)
      setConfirmOpen(false)
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeProducts)
      showUndoToast("Cuenta borrada", () =>
        restoreAccount.mutate(accountId, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  usePageHeader(
    {
      variant: "secondary",
      title: account?.institutionName || account?.name || "Cuenta",
      onBack: () => {
        router.push(
          account?.institutionId
            ? APP_ROUTES.app.financeInstitution(account.institutionId)
            : APP_ROUTES.app.financeProducts
        )
      },
      actions: (
        <>
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
            aria-label="Opciones de la cuenta"
            onClick={() => setOpenOptionsSheet(true)}
          >
            <MoreVerticalIcon />
          </Button>
        </>
      ),
      accentColor: accent,
    },
    [
      account?.id,
      account?.name,
      account?.institutionName,
      account?.institutionId,
      accent,
      setOpenOptionsSheet,
    ]
  )

  if (accountsQuery.isPending && !account) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!account) {
    return (
      <MissingRecord
        icon={WalletIcon}
        title="No encontramos esta cuenta"
        description="Puede que se haya archivado o borrado."
        backHref={APP_ROUTES.app.financeProducts}
        backLabel="Volver a Productos"
      />
    )
  }

  return (
    <>
      {accountsQuery.error ? (
        <div className="mb-3">
          <ErrorState
            message={financeLoadErrorMessage(accountsQuery.error)}
            onRetry={() => void accountsQuery.refetch()}
            isRetrying={accountsQuery.isFetching}
          />
        </div>
      ) : null}

      <div className="-mx-4 -mt-4 overflow-hidden md:-mx-6">
        <div
          className="relative overflow-hidden rounded-b-3xl p-4 text-white md:p-6"
          style={{
            background: accent,
          }}
        >
          <span aria-hidden className="pointer-events-none absolute inset-0">
            <span className="absolute -top-8 -right-12 size-56 rounded-full bg-white/15" />
            <span className="absolute right-16 -bottom-15 size-48 rounded-full bg-black/15" />
          </span>
          <div className="relative z-10">
            <DetailHeader
              media={
                <BrandLogo
                  name={account.institutionName ?? account.name}
                  logoUrl={account.institutionLogoUrl}
                  size={48}
                />
              }
              title={account.name}
              subtitle={`${FINANCE_ACCOUNT_TYPE_LABEL[account.type]} · ${account.currency}`}
            />
            <div className="mt-8 flex flex-col gap-1 rounded-2xl bg-black/20 px-3 py-2">
              <div className="flex items-center gap-1">
                <Label className="text-sm text-foreground">Saldo</Label>
                <GlossaryHelpButton
                  slug="saldo"
                  className="text-white/70 hover:text-white"
                />
              </div>
              <p className="text-3xl font-bold tracking-tight tabular-nums">
                {formatFinanceMoney(account.balance, accountDisplay)}
              </p>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>
                  Libre{" "}
                  {formatFinanceMoney(account.freeBalance, accountDisplay)}
                </span>
                <span>
                  Apartado{" "}
                  {formatFinanceMoney(account.earmarkedAmount, accountDisplay)}
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/20 px-3 py-2">
                <p className="text-[11px] tracking-wide text-white/70 uppercase">
                  Ingresos -{monthChip}
                </p>
                <p className="mt-1 text-sm font-semibold text-[color-mix(in_srgb,var(--success)_42%,white)] tabular-nums">
                  + {formatFinanceMoney(monthTotals.income, accountDisplay)}
                </p>
              </div>
              <div className="rounded-2xl bg-black/20 px-3 py-2">
                <p className="text-[11px] tracking-wide text-white/70 uppercase">
                  Egresos -{monthChip}
                </p>
                <p className="mt-1 text-sm font-semibold text-[color-mix(in_srgb,var(--destructive)_55%,white)] tabular-nums">
                  − {formatFinanceMoney(monthTotals.expenses, accountDisplay)}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-white/60">
              Los totales no incluyen transferencias.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 -mt-4 flex flex-col gap-3 rounded-3xl bg-background">
        <IrregularitiesSection
          drifts={accountDrifts}
          reconciliationItems={accountReconciliations}
          display={accountDisplay}
          driftHref={() => null}
          reconciliationHref={() =>
            `${pathname}?sheet=${FINANCE_SHEET_KEYS.accountReconciliation}`
          }
          recalculatePending={recalculateBalance.isPending}
          onRecalculate={(drift) => {
            recalculateBalance.mutate(recalculationPayload(drift), {
              onSuccess: () => appToast.success({ text1: "Saldo corregido" }),
              onError: (error) =>
                appToast.error({ text1: financeErrorMessage(error) }),
            })
          }}
        />
        <FinanceInstrumentMovements
          enabled={isEnabled}
          display={accountDisplay}
          sources={movementSources}
          emptyLabel="Sin movimientos"
          emptyDescription="Registra un gasto o un ingreso de esta cuenta."
          createLabel="Movimiento"
          onCreate={() =>
            router.push(
              financeTransactionNewHref({
                type: "DEBIT",
                destination: encodeLedgerTarget("account", account.id),
                returnTo: pathname,
              })
            )
          }
        />
        <StatementImportButton accountId={account.id} className="w-full" />
        <ReconciliationsSection
          enabled={isEnabled}
          target={{ accountId: account.id }}
          display={accountDisplay}
        />
      </div>

      <RecordOptionsSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        description={account.name}
        options={[
          {
            id: "edit",
            title: "Editar cuenta",
            icon: PencilIcon,
            onPress: () => setOpenAccountSheet(true),
          },
          {
            id: "balance",
            title: "Ajustar saldo",
            icon: ScaleIcon,
            onPress: () => setOpenBalanceSheet(true),
          },
          {
            id: "reconcile",
            title: "Conciliar",
            icon: LandmarkIcon,
            onPress: () => setOpenReconciliationSheet(true),
          },
          {
            id: "history",
            title: "Historial",
            icon: HistoryIcon,
            onPress: () => setOpenHistorySheet(true),
          },
          {
            id: "archive",
            title: "Archivar",
            icon: ArchiveIcon,
            disabled: archiveAccount.isPending || deleteAccount.isPending,
            onPress: () => setArchiveConfirmOpen(true),
          },
          {
            id: "delete",
            title: "Eliminar",
            icon: Trash2Icon,
            destructive: true,
            disabled: archiveAccount.isPending || deleteAccount.isPending,
            onPress: () => setConfirmOpen(true),
          },
        ]}
      />

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !deleteAccount.isPending) {
            setConfirmOpen(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2Icon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Eliminar “{account.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminan sus movimientos, tarjetas débito y saldos. No se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Button
            type="button"
            variant="outline"
            disabled={deleteAccount.isPending || archiveAccount.isPending}
            className={cn("justify-start", PRESSABLE_CLASS)}
            onClick={() => void onArchiveAccount()}
          >
            <ArchiveIcon className="size-4 shrink-0" aria-hidden="true" />
            ¿Solo ocultarla? Archivar
          </Button>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccount.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteAccount.isPending}
              onClick={() => void onDeleteAccount()}
            >
              {deleteAccount.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Trash2Icon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {deleteAccount.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={archiveConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !archiveAccount.isPending) {
            setArchiveConfirmOpen(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-muted text-muted-foreground">
              <ArchiveIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Archivar “{account.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Deja de aparecer en las listas. Puedes restaurarlo desde la
              papelera de reciclaje o con Deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveAccount.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={archiveAccount.isPending}
              onClick={() => void onArchiveAccount()}
            >
              {archiveAccount.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <ArchiveIcon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {archiveAccount.isPending ? "Archivando..." : "Archivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AccountSheet
        open={openAccountSheet}
        onOpenChange={setOpenAccountSheet}
        account={account}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
      />
      <AccountBalanceSheet
        open={openBalanceSheet}
        onOpenChange={setOpenBalanceSheet}
        account={account}
        display={accountDisplay}
      />
      <InstrumentHistorySheet
        open={openHistorySheet}
        onOpenChange={setOpenHistorySheet}
        target={{ kind: "account", id: account.id }}
        display={accountDisplay}
        helpSheetKey={FINANCE_SHEET_KEYS.accountHistory}
      />
      <ReconciliationSheet
        open={openReconciliationSheet}
        onOpenChange={setOpenReconciliationSheet}
        target={{
          kind: "account",
          id: account.id,
          currency: account.currency,
          name: account.name,
          balance: account.balance,
        }}
        display={accountDisplay}
        helpSheetKey={FINANCE_SHEET_KEYS.accountReconciliation}
      />
    </>
  )
}
