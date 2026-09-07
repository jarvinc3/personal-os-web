"use client"

import { AccountSheet } from "@/src/modules/finance/components/catalog/account-sheet";
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page";
import { FINANCE_ACCOUNT_TYPE_LABEL } from "@/src/modules/finance/constants/catalog";
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import type { FinanceAccount } from "@/src/modules/finance/types/entities";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import { LoadingView } from "@/src/shared/components/layout/loading-view";
import { SettingsRow } from "@/src/shared/components/layout/settings-section";
import { Button } from "@/src/shared/components/ui/button";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { usePageHeader } from "@/src/shared/hooks/use-page-header";
import { MoreVerticalIcon, PencilIcon, WalletIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

const FALLBACK_COLOR = "#334155"

type CashAccountDetailClientProps = {
  accountId: string
}

export function CashAccountDetailClient({
  accountId,
}: CashAccountDetailClientProps) {
  return (
    <FinanceAuthenticatedPage>
      <CashAccountDetailView accountId={accountId} />
    </FinanceAuthenticatedPage>
  )
}

function CashAccountDetailView({ accountId }: CashAccountDetailClientProps) {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const accountsQuery = useAccounts(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const account =
    (accountsQuery.data ?? []).find((item) => item.id === accountId) ?? null
  const institutions = institutionsQuery.data ?? []
  const accent = account?.color ?? FALLBACK_COLOR

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.financeAccounts)
  }, [router])

  const openMenu = useCallback(() => setMenuOpen(true), [setMenuOpen])

  const headerActions = useMemo(
    () => (
      <Button
        variant="ghost"
        size="icon"
        className="size-9 rounded-full"
        aria-label="Opciones de la cuenta"
        onClick={openMenu}
      >
        <MoreVerticalIcon />
      </Button>
    ),
    [openMenu],
  )

  usePageHeader(
    {
      variant: "secondary",
      title: account?.name ?? "Efectivo",
      onBack: handleBack,
      actions: headerActions,
      accentColor: accent,
      scrollHide: false,
    },
    [account?.id, account?.name, accent, handleBack, headerActions],
  )

  if (accountsQuery.isPending && !account) {
    return <LoadingView />
  }

  if (!account || account.type !== "CASH") {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
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

      <div className="-mx-4 -mt-4 overflow-hidden md:-mx-6">
        <div
          className="px-4 pb-10 pt-6 text-white md:px-6"
          style={{
            background: `linear-gradient(160deg, ${accent} 0%, #0b1220 100%)`,
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-black/30">
              <WalletIcon className="size-5" />
            </div>
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
            {formatFinanceMoney(account.balance, {
              ...display,
              currency: account.currency,
            })}
          </p>
        </div>

        <div className="-mt-4 rounded-t-3xl bg-background px-4 pb-8 pt-6 md:px-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSheetOpen(true)}
          >
            <PencilIcon />
            Editar cuenta
          </Button>
        </div>
      </div>

      <BottomSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="Opciones"
        description={account.name}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsRow
            label="Editar cuenta"
            icon={PencilIcon}
            onPress={() => {
              setMenuOpen(false)
              setSheetOpen(true)
            }}
            isLast
          />
        </div>
      </BottomSheet>

      <AccountSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        account={account as FinanceAccount}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
      />
    </>
  )
}
