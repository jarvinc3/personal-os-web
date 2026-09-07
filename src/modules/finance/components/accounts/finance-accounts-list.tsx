"use client"

import { InstitutionSwapStack } from "@/src/modules/finance/components/accounts/institution-swap-stack";
import { InstitutionSheet } from "@/src/modules/finance/components/catalog/institution-sheet";
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts";
import { useAnalyticsSummary } from "@/src/modules/finance/hooks/use-analytics";
import { useCards } from "@/src/modules/finance/hooks/use-cards";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions";
import { useLoans } from "@/src/modules/finance/hooks/use-loans";
import { financeDashboardRange } from "@/src/modules/finance/lib/dashboard-period";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import { buildInstitutionStackItems } from "@/src/modules/finance/lib/institution-stack";
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import type { FinanceInstitution } from "@/src/modules/finance/types/entities";
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section";
import { Button } from "@/src/shared/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { Building2Icon, PlusIcon, TagsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SheetState =
  | { kind: "none" }
  | { kind: "institution"; item: FinanceInstitution | null }

type FinanceAccountsListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
  defaultCurrency: string
}

export function FinanceAccountsList({
  enabled,
  display,
}: FinanceAccountsListProps) {
  const router = useRouter()
  const { config } = useFinanceEnabled()
  const range = useMemo(
    () => financeDashboardRange(config.dashboardPeriod, config.weekStartsOn),
    [config.dashboardPeriod, config.weekStartsOn],
  )
  const institutionsQuery = useInstitutions(enabled)
  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const loansQuery = useLoans(enabled)
  const summaryQuery = useAnalyticsSummary(enabled, range)
  const [sheet, setSheet] = useState<SheetState>({ kind: "none" })

  const stackItems = useMemo(
    () =>
      buildInstitutionStackItems({
        institutions: institutionsQuery.data ?? [],
        accounts: accountsQuery.data ?? [],
        cards: cardsQuery.data ?? [],
        loans: loansQuery.data ?? [],
      }),
    [
      institutionsQuery.data,
      accountsQuery.data,
      cardsQuery.data,
      loansQuery.data,
    ],
  )

  const netWorthLabel = summaryQuery.data
    ? formatFinanceMoney(summaryQuery.data.netWorth, {
      ...display,
      currency: summaryQuery.data.baseCurrency ?? display.currency,
    })
    : "—"

  const errorMessage = useMemo(() => {
    const error =
      institutionsQuery.error ??
      accountsQuery.error ??
      cardsQuery.error ??
      loansQuery.error
    return error ? financeErrorMessage(error) : null
  }, [
    institutionsQuery.error,
    accountsQuery.error,
    cardsQuery.error,
    loansQuery.error,
  ])

  const stackPending =
    institutionsQuery.isPending ||
    accountsQuery.isPending ||
    cardsQuery.isPending ||
    loansQuery.isPending

  function closeSheet() {
    setSheet({ kind: "none" })
  }

  return (
    <>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <div className="flex flex-col items-center gap-1 px-2 pb-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Balance total
        </p>
        <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
          {summaryQuery.isPending && !summaryQuery.data ? "…" : netWorthLabel}
        </p>
      </div>

      <div>
        {stackPending ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : stackItems.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2Icon />
              </EmptyMedia>
              <EmptyTitle>Aún no hay instituciones</EmptyTitle>
              <EmptyDescription>
                Agrégala antes de crear una cuenta o una tarjeta. También puedes
                crear una cuenta de efectivo sin institución.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                onClick={() => setSheet({ kind: "institution", item: null })}
              >
                Crear institución
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <InstitutionSwapStack
            items={stackItems}
            display={display}
            onSelect={(item) => {
              if (item.kind === "institution") {
                router.push(APP_ROUTES.app.financeInstitution(item.id))
                return
              }
              router.push(APP_ROUTES.app.financeCashAccount(item.id))
            }}
          />
        )}
      </div>

      <SettingsSection title="Atajos">
        <SettingsRow
          label="Categorías"
          description="Organiza gastos e ingresos"
          icon={TagsIcon}
          onPress={() => router.push(APP_ROUTES.app.financeCategories)}
          isLast
        />
      </SettingsSection>

      <Button
        type="button"
        size="icon-lg"
        aria-label="Nueva institución"
        className="fixed right-4 z-50 size-14 rounded-full shadow-xl bottom-[calc(6rem+env(safe-area-inset-bottom))] md:bottom-8"
        onClick={() => setSheet({ kind: "institution", item: null })}
      >
        <PlusIcon className="size-6" />
      </Button>

      <InstitutionSheet
        open={sheet.kind === "institution"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        institution={sheet.kind === "institution" ? sheet.item : null}
      />
    </>
  )
}
