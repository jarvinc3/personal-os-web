"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale/es"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import {
  AccountBalanceSheet,
  AccountSheet,
} from "@/src/modules/finance/catalog"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceInstrumentMovements } from "@/src/modules/finance/transactions"
import { FINANCE_ACCOUNT_TYPE_LABEL } from "@/src/modules/finance/shared/constants/catalog"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import {
  useAccounts,
  useArchiveAccount,
  useDeleteAccount,
} from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useAllTransactions } from "@/src/modules/finance/shared/hooks/use-transactions"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { encodeLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import { isoMonthBounds } from "@/src/modules/finance/shared/lib/month-window"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { visibleTransactionTotals } from "@/src/modules/finance/shared/lib/transactions-query"
import { DeleteRecordDialog } from "@/src/modules/finance/shared/components/delete-record-dialog"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  APP_ROUTES,
  financeTransactionNewHref,
} from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ArchiveIcon,
  MoreVerticalIcon,
  PencilIcon,
  ScaleIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
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
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const accountsQuery = useAccounts(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const cardsQuery = useCards(isEnabled)
  const archiveAccount = useArchiveAccount()
  const deleteAccount = useDeleteAccount()
  const { open: openAccountSheet, setOpen: setOpenAccountSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.account)
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.cashAccountOptions)
  const { open: openBalanceSheet, setOpen: setOpenBalanceSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.accountBalance)

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
  const monthChip = format(today, "MMM yyyy", { locale: es })
    .replace(/\./g, "")
    .toUpperCase()
  const monthBounds = isoMonthBounds(today.getFullYear(), today.getMonth() + 1)
  const monthQuery = useAllTransactions(isEnabled, {
    accountId,
    dateFrom: monthBounds.dateFrom,
    dateTo: monthBounds.dateTo,
  })
  const monthTotals = visibleTransactionTotals(monthQuery.data ?? [])
  const accountDisplay = {
    ...display,
    currency: account?.currency ?? display.currency,
  }

  const [confirmOpen, setConfirmOpen] = useState(false)

  async function onArchiveAccount() {
    if (!account) {
      return
    }
    try {
      await archiveAccount.mutateAsync(account.id)
      appToast.success({ text1: "Cuenta archivada" })
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeProducts)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDeleteAccount() {
    if (!account) {
      return
    }
    try {
      await deleteAccount.mutateAsync(account.id)
      appToast.success({ text1: "Cuenta borrada" })
      setConfirmOpen(false)
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeProducts)
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
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full"
          aria-label="Opciones de la cuenta"
          onClick={() => setOpenOptionsSheet(true)}
        >
          <MoreVerticalIcon />
        </Button>
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
    return <LoadingView />
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
          <FinanceErrorState
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
            <div className="flex items-start gap-3">
              <BrandLogo
                name={account.institutionName ?? account.name}
                logoUrl={account.institutionLogoUrl}
                size={48}
              />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {account.name}
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  {FINANCE_ACCOUNT_TYPE_LABEL[account.type]} ·{" "}
                  {account.currency}
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-1 rounded-2xl bg-black/20 px-3 py-2">
              <Label className="text-sm text-foreground">Saldo</Label>
              <p className="text-3xl font-bold tracking-tight tabular-nums">
                {formatFinanceMoney(account.balance, accountDisplay)}
              </p>
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
          </div>
        </div>
      </div>

      <div className="mx-4 -mt-4 flex flex-col gap-3 rounded-3xl bg-background">
        <FinanceInstrumentMovements
          enabled={isEnabled}
          display={accountDisplay}
          sources={movementSources}
          emptyLabel="Sin movimientos"
          emptyDescription="Registra un gasto o un ingreso de esta cuenta."
          createLabel="Movimiento"
          onCreate={() =>
            router.push(
              financeTransactionNewHref(
                "DEBIT",
                encodeLedgerTarget("account", account.id)
              )
            )
          }
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
            onPress: () => {
              setOpenOptionsSheet(false)
              setOpenAccountSheet(true)
            },
          },
          {
            id: "balance",
            title: "Ajustar saldo",
            icon: ScaleIcon,
            onPress: () => {
              setOpenOptionsSheet(false)
              setOpenBalanceSheet(true)
            },
          },
          {
            id: "archive",
            title: "Archivar",
            icon: ArchiveIcon,
            disabled: archiveAccount.isPending || deleteAccount.isPending,
            onPress: () => void onArchiveAccount(),
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

      <DeleteRecordDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        recordName={account.name}
        pending={deleteAccount.isPending}
        consequences="Se eliminan sus movimientos, tarjetas débito y saldos. No se puede deshacer."
        onConfirm={() => void onDeleteAccount()}
        archive={{
          label: "¿Solo ocultarla? Archivar",
          pending: archiveAccount.isPending,
          onArchive: () => void onArchiveAccount(),
        }}
      />

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
    </>
  )
}
