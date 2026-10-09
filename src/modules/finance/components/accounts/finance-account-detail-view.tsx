"use client"

import { BrandLogo } from "@/src/modules/finance/components/brand-logo"
import { AccountBalanceSheet } from "@/src/modules/finance/components/catalog/account-balance-sheet"
import { AccountSheet } from "@/src/modules/finance/components/catalog/account-sheet"
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { FinanceErrorState } from "@/src/modules/finance/components/layout/finance-error-state"
import { FinanceInstrumentMovements } from "@/src/modules/finance/components/transactions/finance-instrument-movements"
import { FINANCE_ACCOUNT_TYPE_LABEL } from "@/src/modules/finance/constants/catalog"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import {
  useAccounts,
  useArchiveAccount,
  useDeleteAccount,
} from "@/src/modules/finance/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions"
import { useAllTransactions } from "@/src/modules/finance/hooks/use-transactions"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/lib/finance-error"
import { encodeLedgerTarget } from "@/src/modules/finance/lib/ledger-payloads"
import { isoMonthBounds } from "@/src/modules/finance/lib/month-window"
import { formatFinanceMoney } from "@/src/modules/finance/lib/money"
import { visibleTransactionTotals } from "@/src/modules/finance/lib/transactions-query"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { SummaryItem } from "@/src/shared/components/ui/summary"
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

const FALLBACK_COLOR = "#334155"

type FinanceAccountDetailClientProps = {
  accountId: string
}

export function FinanceAccountDetailClient({
  accountId,
}: FinanceAccountDetailClientProps) {
  return (
    <FinanceAuthenticatedPage>
      <FinanceAccountDetailView accountId={accountId} />
    </FinanceAuthenticatedPage>
  )
}

function FinanceAccountDetailView({
  accountId,
}: FinanceAccountDetailClientProps) {
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

  async function onArchiveAccount() {
    if (!account) {
      return
    }
    try {
      await archiveAccount.mutateAsync(account.id)
      appToast.success({ text1: "Cuenta archivada" })
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeAccounts)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDeleteAccount() {
    if (!account) {
      return
    }
    const confirmed = window.confirm(
      "¿Borrar esta cuenta? Se eliminan sus movimientos, tarjetas débito y saldos. No se puede deshacer."
    )
    if (!confirmed) {
      return
    }
    try {
      await deleteAccount.mutateAsync(account.id)
      appToast.success({ text1: "Cuenta borrada" })
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeAccounts)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  usePageHeader(
    {
      variant: "secondary",
      title: account?.name ?? "Cuenta",
      onBack: () => {
        router.push(
          account?.institutionId
            ? APP_ROUTES.app.financeInstitution(account.institutionId)
            : APP_ROUTES.app.financeAccounts
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
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WalletIcon />
          </EmptyMedia>
          <EmptyTitle>No encontramos esta cuenta</EmptyTitle>
          <EmptyDescription>
            Puede que se haya archivado o borrado.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            onClick={() => router.push(APP_ROUTES.app.financeAccounts)}
          >
            Volver a Cuentas
          </Button>
        </EmptyContent>
      </Empty>
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
          className="rounded-b-3xl p-4 text-white md:p-6"
          style={{
            background: accent,
          }}
        >
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
                {FINANCE_ACCOUNT_TYPE_LABEL[account.type]} · {account.currency}
              </p>
            </div>
          </div>
          <p className="mt-8 text-3xl font-bold tracking-tight tabular-nums">
            {formatFinanceMoney(account.balance, accountDisplay)}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-black/20 px-3 py-2">
              <p className="text-[11px] tracking-wide text-white/70 uppercase">
                Ingresos (mes)
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                + {formatFinanceMoney(monthTotals.income, accountDisplay)}
              </p>
            </div>
            <div className="rounded-2xl bg-black/20 px-3 py-2">
              <p className="text-[11px] tracking-wide text-white/70 uppercase">
                Egresos (mes)
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                − {formatFinanceMoney(monthTotals.expenses, accountDisplay)}
              </p>
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

      <BottomSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        title="Opciones"
        description={account.name}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <SummaryItem
            title="Editar cuenta"
            icon={PencilIcon}
            onPress={() => setOpenAccountSheet(true)}
            isLast={false}
            className="px-3"
          />
          <SummaryItem
            title="Ajustar saldo"
            icon={ScaleIcon}
            onPress={() => {
              setOpenOptionsSheet(false)
              setOpenBalanceSheet(true)
            }}
            isLast={false}
            className="px-3"
          />
          <SummaryItem
            title="Archivar"
            icon={ArchiveIcon}
            onPress={() => void onArchiveAccount()}
            disabled={archiveAccount.isPending || deleteAccount.isPending}
            isLast={false}
            className="px-3 text-destructive"
          />
          <SummaryItem
            title="Borrar"
            icon={Trash2Icon}
            onPress={() => void onDeleteAccount()}
            disabled={archiveAccount.isPending || deleteAccount.isPending}
            isLast
            className="px-3 text-destructive"
          />
        </div>
      </BottomSheet>

      <AccountSheet
        open={openAccountSheet}
        onOpenChange={setOpenAccountSheet}
        account={account}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
        display={accountDisplay}
        onDeleted={() => router.push(APP_ROUTES.app.financeAccounts)}
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
