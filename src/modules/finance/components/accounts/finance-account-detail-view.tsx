"use client"

import { AccountSheet } from "@/src/modules/finance/components/catalog/account-sheet";
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page";
import { FINANCE_ACCOUNT_TYPE_LABEL } from "@/src/modules/finance/constants/catalog";
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys";
import { useAccounts, useArchiveAccount, useDeleteAccount } from "@/src/modules/finance/hooks/use-accounts";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import { LoadingView } from "@/src/shared/components/layout/loading-view";
import { Button } from "@/src/shared/components/ui/button";
import { SummaryItem } from "@/src/shared/components/ui/summary";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { usePageHeader } from "@/src/shared/hooks/use-page-header";
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params";
import { appToast } from "@/src/shared/lib/app-toast";
import { ArchiveIcon, MoreVerticalIcon, PencilIcon, Trash2Icon, WalletIcon } from "lucide-react";
import { useRouter } from "next/navigation";

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

function FinanceAccountDetailView({ accountId }: FinanceAccountDetailClientProps) {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const accountsQuery = useAccounts(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const archiveAccount = useArchiveAccount()
  const deleteAccount = useDeleteAccount()
  const { open: openAccountSheet, setOpen: setOpenAccountSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.account)
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.cashAccountOptions)

  const account =
    (accountsQuery.data ?? []).find((item) => item.id === accountId) ?? null
  const institutions = institutionsQuery.data ?? []
  const accent = account?.color ?? FALLBACK_COLOR

  async function onArchiveAccount() {
    if (!account) return
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
    if (!account) return
    const confirmed = window.confirm(
      "¿Borrar esta cuenta? Se eliminan sus movimientos, tarjetas débito y saldos. No se puede deshacer."
    )
    if (!confirmed) return
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
      title: account?.name ?? "Efectivo",
      onBack: () => {
        router.push(APP_ROUTES.app.financeAccounts)
      },
      actions: (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full size-9"
          aria-label="Opciones de la cuenta"
          onClick={() => setOpenOptionsSheet(true)}
        >
          <MoreVerticalIcon />
        </Button>
      ),
      accentColor: accent,
    },
    [account?.id, account?.name, accent, setOpenOptionsSheet]
  )

  if (accountsQuery.isPending && !account) {
    return <LoadingView />
  }

  if (!account || account.type !== "CASH") {
    return (
      <div className="flex flex-col gap-3 items-center py-16">
        <WalletIcon className="size-8 text-muted-foreground" />
        <p className="text-center text-muted-foreground">
          No encontramos esta cuenta de efectivo.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push(APP_ROUTES.app.financeAccounts)}
        >
          Volver a Cuentas
        </Button>
      </div>
    )
  }

  return (
    <>
      {accountsQuery.error ? (
        <p className="mb-3 text-sm text-destructive">
          {financeErrorMessage(accountsQuery.error)}
        </p>
      ) : null}

      <div className="overflow-hidden -mx-4 -mt-4 md:-mx-6">
        <div
          className="px-4 pt-6 pb-10 text-white rounded-b-3xl md:px-6"
          style={{
            background: accent,
          }}
        >
          <div className="flex gap-3 items-start">
            <div className="flex justify-center items-center rounded-xl size-12 bg-black/30">
              <WalletIcon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight truncate">
                {account.name}
              </h1>
              <p className="mt-1 text-sm text-white/70">
                {FINANCE_ACCOUNT_TYPE_LABEL[account.type]} · {account.currency}
              </p>
            </div>
          </div>
          <p className="mt-8 text-3xl font-bold tabular-nums tracking-tight">
            {formatFinanceMoney(account.balance, {
              ...display,
              currency: account.currency,
            })}
          </p>
        </div>
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
        display={display}
        onDeleted={() => router.push(APP_ROUTES.app.financeAccounts)}
      />
    </>
  )
}
