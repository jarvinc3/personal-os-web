"use client"

import {
  AccountProductRow,
  CardProductRow,
  InstitutionDetailTabs,
  InstitutionProductEmpty,
  LoanProductRow,
  type InstitutionDetailTab,
} from "@/src/modules/finance/components/accounts/institution-product-lists";
import { AccountSheet } from "@/src/modules/finance/components/catalog/account-sheet";
import { CardBalanceSheet } from "@/src/modules/finance/components/catalog/card-balance-sheet";
import { CardSheet } from "@/src/modules/finance/components/catalog/card-sheet";
import { InstitutionSheet } from "@/src/modules/finance/components/catalog/institution-sheet";
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page";
import { LoanSheet } from "@/src/modules/finance/components/planning/loan-sheet";
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts";
import { useCards } from "@/src/modules/finance/hooks/use-cards";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions";
import { useLoans } from "@/src/modules/finance/hooks/use-loans";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import {
  buildInstitutionStackItems,
  formatProductCounts,
  institutionInitials,
} from "@/src/modules/finance/lib/institution-stack";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
  FinanceLoan,
} from "@/src/modules/finance/types/entities";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import { LoadingView } from "@/src/shared/components/layout/loading-view";
import { SettingsRow } from "@/src/shared/components/layout/settings-section";
import { Button } from "@/src/shared/components/ui/button";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { usePageHeader } from "@/src/shared/hooks/use-page-header";
import { accentSurfaceGradient } from "@/src/shared/lib/accent-gradient";
import {
  Building2Icon,
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  MoreVerticalIcon,
  PencilIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

const FALLBACK_COLOR = "#1B4332"

type SheetState =
  | { kind: "none" }
  | { kind: "institution"; item: FinanceInstitution | null }
  | { kind: "account"; item: FinanceAccount | null }
  | { kind: "card"; item: FinanceCard | null }
  | { kind: "card-balance"; item: FinanceCard }
  | { kind: "loan"; item: FinanceLoan | null }

type InstitutionDetailClientProps = {
  institutionId: string
}

export function InstitutionDetailClient({
  institutionId,
}: InstitutionDetailClientProps) {
  return (
    <FinanceAuthenticatedPage>
      <InstitutionDetailView institutionId={institutionId} />
    </FinanceAuthenticatedPage>
  )
}

function InstitutionDetailView({ institutionId }: InstitutionDetailClientProps) {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const institutionsQuery = useInstitutions(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const cardsQuery = useCards(isEnabled)
  const loansQuery = useLoans(isEnabled)

  const [tab, setTab] = useState<InstitutionDetailTab>("accounts")
  const [sheet, setSheet] = useState<SheetState>({ kind: "none" })
  const [menuOpen, setMenuOpen] = useState(false)

  const institutions = institutionsQuery.data ?? []
  const accounts = accountsQuery.data ?? []

  const stackItem = useMemo(() => {
    const items = buildInstitutionStackItems({
      institutions: institutionsQuery.data ?? [],
      accounts: accountsQuery.data ?? [],
      cards: cardsQuery.data ?? [],
      loans: loansQuery.data ?? [],
    })
    return items.find(
      (item) => item.kind === "institution" && item.id === institutionId,
    )
  }, [
    institutionsQuery.data,
    accountsQuery.data,
    cardsQuery.data,
    loansQuery.data,
    institutionId,
  ])

  const institution =
    stackItem?.kind === "institution"
      ? stackItem.institution
      : (institutions.find((item) => item.id === institutionId) ?? null)

  const accent = institution?.color ?? FALLBACK_COLOR

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
        aria-label="Opciones de la institución"
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
      title: institution?.name ?? "Institución",
      onBack: handleBack,
      actions: headerActions,
      accentColor: accent,
    },
    [handleBack, institution?.id, institution?.name, accent, headerActions],
  )

  const isLoading =
    institutionsQuery.isPending ||
    accountsQuery.isPending ||
    cardsQuery.isPending ||
    loansQuery.isPending

  const error =
    institutionsQuery.error ??
    accountsQuery.error ??
    cardsQuery.error ??
    loansQuery.error

  function closeSheet() {
    setSheet({ kind: "none" })
  }

  function runMenuAction(action: () => void) {
    setMenuOpen(false)
    action()
  }

  if (isLoading && !institution) {
    return <LoadingView />
  }

  if (!institution) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Building2Icon className="size-8 text-muted-foreground" />
        <p className="text-center text-muted-foreground">
          No encontramos esta institución.
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

  const counts =
    stackItem?.kind === "institution"
      ? stackItem.counts
      : { accounts: 0, cards: 0, loans: 0 }
  const balance =
    stackItem?.kind === "institution" ? stackItem.consolidatedBalance : 0
  const institutionAccounts =
    stackItem?.kind === "institution" ? stackItem.accounts : []
  const institutionCards =
    stackItem?.kind === "institution" ? stackItem.cards : []
  const institutionLoans =
    stackItem?.kind === "institution" ? stackItem.loans : []

  return (
    <>
      {error ? (
        <p className="mb-3 text-sm text-destructive">
          {financeErrorMessage(error)}
        </p>
      ) : null}

      <div className="-mx-4 -mt-4 overflow-hidden md:-mx-6">
        <div
          className="px-4 pb-10 pt-6 text-white md:px-6"
          style={{
            background: accentSurfaceGradient(accent),
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-black/30 text-sm font-bold tracking-wide">
              {institutionInitials(institution.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {institution.name}
              </h1>
              <p className="mt-1 text-sm text-white/70">
                {formatProductCounts(counts)}
              </p>
            </div>
          </div>
          <p className="mt-8 text-3xl font-bold tracking-tight tabular-nums">
            {formatFinanceMoney(balance, display)}
          </p>
        </div>

        <div className="-mt-4 rounded-t-3xl bg-background px-4 pb-8 pt-4 md:px-6">
          <InstitutionDetailTabs
            value={tab}
            onChange={setTab}
            accentColor={accent}
          />

          <div className="mt-4 flex flex-col gap-3">
            {tab === "accounts" ? (
              institutionAccounts.length === 0 ? (
                <InstitutionProductEmpty
                  tab="accounts"
                  onCreate={() => setSheet({ kind: "account", item: null })}
                />
              ) : (
                institutionAccounts.map((account) => (
                  <AccountProductRow
                    key={account.id}
                    account={account}
                    display={display}
                    onPress={() => setSheet({ kind: "account", item: account })}
                  />
                ))
              )
            ) : null}

            {tab === "cards" ? (
              institutionCards.length === 0 ? (
                <InstitutionProductEmpty
                  tab="cards"
                  onCreate={() => setSheet({ kind: "card", item: null })}
                />
              ) : (
                institutionCards.map((card) => (
                  <CardProductRow
                    key={card.id}
                    card={card}
                    display={display}
                    onPress={() => setSheet({ kind: "card", item: card })}
                  />
                ))
              )
            ) : null}

            {tab === "loans" ? (
              institutionLoans.length === 0 ? (
                <InstitutionProductEmpty
                  tab="loans"
                  onCreate={() => setSheet({ kind: "loan", item: null })}
                />
              ) : (
                institutionLoans.map((loan) => (
                  <LoanProductRow
                    key={loan.id}
                    loan={loan}
                    display={display}
                    onPress={() => setSheet({ kind: "loan", item: loan })}
                  />
                ))
              )
            ) : null}
          </div>
        </div>
      </div>

      <BottomSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="Opciones"
        description={institution.name}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsRow
            label="Editar institución"
            icon={PencilIcon}
            onPress={() =>
              runMenuAction(() =>
                setSheet({ kind: "institution", item: institution }),
              )
            }
          />
          <SettingsRow
            label="Nueva cuenta"
            icon={LandmarkIcon}
            onPress={() =>
              runMenuAction(() => setSheet({ kind: "account", item: null }))
            }
          />
          <SettingsRow
            label="Nueva tarjeta"
            icon={CreditCardIcon}
            onPress={() =>
              runMenuAction(() => setSheet({ kind: "card", item: null }))
            }
          />
          <SettingsRow
            label="Nuevo préstamo"
            icon={HandCoinsIcon}
            onPress={() =>
              runMenuAction(() => setSheet({ kind: "loan", item: null }))
            }
          />
          <SettingsRow
            label="Sincronización"
            description="Conecta bancos y proveedores"
            icon={RefreshCwIcon}
            onPress={() =>
              runMenuAction(() => router.push(APP_ROUTES.app.financeSync))
            }
            isLast
          />
        </div>
      </BottomSheet>

      <InstitutionSheet
        open={sheet.kind === "institution"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        institution={sheet.kind === "institution" ? sheet.item : null}
      />

      <AccountSheet
        open={sheet.kind === "account"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        account={sheet.kind === "account" ? sheet.item : null}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
        defaultInstitutionId={institutionId}
      />

      <CardSheet
        open={sheet.kind === "card"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        card={sheet.kind === "card" ? sheet.item : null}
        institutions={institutions}
        accounts={accounts}
        defaultCurrency={config.baseCurrency}
        defaultInstitutionId={institutionId}
        onUpdateBalance={(item) => setSheet({ kind: "card-balance", item })}
      />

      <CardBalanceSheet
        open={sheet.kind === "card-balance"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        card={sheet.kind === "card-balance" ? sheet.item : null}
        defaultCurrency={config.baseCurrency}
      />

      <LoanSheet
        open={sheet.kind === "loan"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        loan={sheet.kind === "loan" ? sheet.item : null}
        accounts={accounts}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
        defaultInstitutionId={institutionId}
      />
    </>
  )
}
