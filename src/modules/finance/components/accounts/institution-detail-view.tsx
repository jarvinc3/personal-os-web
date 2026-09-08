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
import { InstitutionSheet } from "@/src/modules/finance/components/accounts/institution-sheet";
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page";
import { LoanSheet } from "@/src/modules/finance/components/planning/loan-sheet";
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys";
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts";
import { useCards } from "@/src/modules/finance/hooks/use-cards";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions";
import { useLoans } from "@/src/modules/finance/hooks/use-loans";
import { useSheetListEntity } from "@/src/modules/finance/hooks/use-sheet-entity";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import {
  buildInstitutionStackItems,
  formatProductCounts,
  institutionInitials,
} from "@/src/modules/finance/lib/institution-stack";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import { LoadingView } from "@/src/shared/components/layout/loading-view";
import { SettingsRow } from "@/src/shared/components/layout/settings-section";
import { Button } from "@/src/shared/components/ui/button";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { usePageHeader } from "@/src/shared/hooks/use-page-header";
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params";
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
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.institutionOptions)
  const { open: openInstitutionSheet, sheetId: institutionSheetId, setOpen: setOpenInstitutionSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.institution)
  const { open: openAccountSheet, sheetId: accountSheetId, setOpen: setOpenAccountSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.account)
  const { open: openCardSheet, sheetId: cardSheetId, setOpen: setOpenCardSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.card)
  const { open: openCardBalanceSheet, sheetId: cardBalanceSheetId, setOpen: setOpenCardBalanceSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.cardBalance)
  const { open: openLoanSheet, sheetId: loanSheetId, setOpen: setOpenLoanSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.loan)

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

  const openMenu = useCallback(
    () => setOpenOptionsSheet(true),
    [setOpenOptionsSheet],
  )

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

  const editingInstitution = useSheetListEntity(
    openInstitutionSheet,
    institutionSheetId,
    institutionsQuery.data,
    institutionsQuery.isPending,
    setOpenInstitutionSheet,
  )
  const editingAccount = useSheetListEntity(
    openAccountSheet,
    accountSheetId,
    accountsQuery.data,
    accountsQuery.isPending,
    setOpenAccountSheet,
  )
  const editingCard = useSheetListEntity(
    openCardSheet,
    cardSheetId,
    cardsQuery.data,
    cardsQuery.isPending,
    setOpenCardSheet,
  )
  const balancingCard = useSheetListEntity(
    openCardBalanceSheet,
    cardBalanceSheetId,
    cardsQuery.data,
    cardsQuery.isPending,
    setOpenCardBalanceSheet,
    true,
  )
  const editingLoan = useSheetListEntity(
    openLoanSheet,
    loanSheetId,
    loansQuery.data,
    loansQuery.isPending,
    setOpenLoanSheet,
  )

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
                  onCreate={() => setOpenAccountSheet(true, null)}
                />
              ) : (
                institutionAccounts.map((account) => (
                  <AccountProductRow
                    key={account.id}
                    account={account}
                    display={display}
                    onPress={() => setOpenAccountSheet(true, account.id)}
                  />
                ))
              )
            ) : null}

            {tab === "cards" ? (
              institutionCards.length === 0 ? (
                <InstitutionProductEmpty
                  tab="cards"
                  onCreate={() => setOpenCardSheet(true, null)}
                />
              ) : (
                institutionCards.map((card) => (
                  <CardProductRow
                    key={card.id}
                    card={card}
                    display={display}
                    onPress={() => setOpenCardSheet(true, card.id)}
                  />
                ))
              )
            ) : null}

            {tab === "loans" ? (
              institutionLoans.length === 0 ? (
                <InstitutionProductEmpty
                  tab="loans"
                  onCreate={() => setOpenLoanSheet(true, null)}
                />
              ) : (
                institutionLoans.map((loan) => (
                  <LoanProductRow
                    key={loan.id}
                    loan={loan}
                    display={display}
                    onPress={() => setOpenLoanSheet(true, loan.id)}
                  />
                ))
              )
            ) : null}
          </div>
        </div>
      </div>

      <BottomSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        title="Opciones"
        description={institution.name}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsRow
            label="Editar institución"
            icon={PencilIcon}
            onPress={() => setOpenInstitutionSheet(true, institution.id)}
          />
          <SettingsRow
            label="Nueva cuenta"
            icon={LandmarkIcon}
            onPress={() => setOpenAccountSheet(true, null)}
          />
          <SettingsRow
            label="Nueva tarjeta"
            icon={CreditCardIcon}
            onPress={() => setOpenCardSheet(true, null)}
          />
          <SettingsRow
            label="Nuevo préstamo"
            icon={HandCoinsIcon}
            onPress={() => setOpenLoanSheet(true, null)}
          />
          <SettingsRow
            label="Sincronización"
            description="Conecta bancos y proveedores"
            icon={RefreshCwIcon}
            onPress={() => router.push(APP_ROUTES.app.financeSync)}
            isLast
          />
        </div>
      </BottomSheet>

      <InstitutionSheet
        open={
          openInstitutionSheet &&
          (!institutionSheetId || Boolean(editingInstitution))
        }
        onOpenChange={setOpenInstitutionSheet}
        institution={
          editingInstitution ?? (!institutionSheetId ? institution : null)
        }
      />

      <AccountSheet
        open={openAccountSheet && (!accountSheetId || Boolean(editingAccount))}
        onOpenChange={setOpenAccountSheet}
        account={editingAccount}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
        defaultInstitutionId={institutionId}
      />

      <CardSheet
        open={openCardSheet && (!cardSheetId || Boolean(editingCard))}
        onOpenChange={setOpenCardSheet}
        card={editingCard}
        institutions={institutions}
        accounts={accounts}
        defaultCurrency={config.baseCurrency}
        defaultInstitutionId={institutionId}
        onUpdateBalance={(item) => setOpenCardBalanceSheet(true, item.id)}
      />

      <CardBalanceSheet
        open={openCardBalanceSheet && Boolean(balancingCard)}
        onOpenChange={setOpenCardBalanceSheet}
        card={balancingCard}
        defaultCurrency={config.baseCurrency}
      />

      <LoanSheet
        open={openLoanSheet && (!loanSheetId || Boolean(editingLoan))}
        onOpenChange={setOpenLoanSheet}
        loan={editingLoan}
        accounts={accounts}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
        defaultInstitutionId={institutionId}
      />
    </>
  )
}
