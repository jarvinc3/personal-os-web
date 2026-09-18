"use client"

import { InstitutionSwapStack } from "@/src/modules/finance/components/accounts/institution-swap-stack"
import { InstitutionSheet } from "@/src/modules/finance/components/accounts/institution-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useBalanceSheet } from "@/src/modules/finance/hooks/use-balance-sheet"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions"
import { useLoans } from "@/src/modules/finance/hooks/use-loans"
import {
  prefetchFinanceCategories,
  prefetchFinanceSync,
} from "@/src/modules/finance/lib/finance-prefetch"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { buildInstitutionStackItems } from "@/src/modules/finance/lib/institution-stack"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/lib/money"
import { SettingsSection } from "@/src/shared/components/layout/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { useQueryClient } from "@tanstack/react-query"
import { Building2Icon, MailIcon, PlusIcon, TagsIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

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
  const queryClient = useQueryClient()
  const { emailSyncEnabled } = useFinanceEnabled()
  const institutionsQuery = useInstitutions(enabled)
  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const loansQuery = useLoans(enabled)
  const balanceSheetQuery = useBalanceSheet(enabled)
  const { open: openInstitutionSheet, setOpen: setOpenInstitutionSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.institution)

  const moneyDisplay = {
    ...display,
    currency: balanceSheetQuery.data?.baseCurrency ?? display.currency,
  }

  const stackItems = useMemo(
    () =>
      buildInstitutionStackItems({
        institutions: institutionsQuery.data ?? [],
        accounts: accountsQuery.data ?? [],
        cards: cardsQuery.data ?? [],
        loans: loansQuery.data ?? [],
        positions: balanceSheetQuery.data?.institutions,
      }),
    [
      institutionsQuery.data,
      accountsQuery.data,
      cardsQuery.data,
      loansQuery.data,
      balanceSheetQuery.data?.institutions,
    ]
  )

  const global = balanceSheetQuery.data?.global
  const netWorthLabel =
    global?.status === "COMPLETE"
      ? formatFinanceMoney(global.netWorth, moneyDisplay)
      : global
        ? "Balance incompleto"
        : "—"

  const errorMessage = useMemo(() => {
    const error =
      institutionsQuery.error ??
      accountsQuery.error ??
      cardsQuery.error ??
      loansQuery.error ??
      balanceSheetQuery.error
    return error ? financeErrorMessage(error) : null
  }, [
    institutionsQuery.error,
    accountsQuery.error,
    cardsQuery.error,
    loansQuery.error,
    balanceSheetQuery.error,
  ])

  const stackPending =
    institutionsQuery.isPending ||
    accountsQuery.isPending ||
    cardsQuery.isPending ||
    loansQuery.isPending ||
    (balanceSheetQuery.isPending && !balanceSheetQuery.data)

  return (
    <>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <div className="flex flex-col items-center gap-1 px-2 pb-2">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Balance total
        </p>
        <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {balanceSheetQuery.isPending && !balanceSheetQuery.data
            ? "…"
            : netWorthLabel}
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
              <Button onClick={() => setOpenInstitutionSheet(true, null)}>
                Crear institución
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <InstitutionSwapStack
            items={stackItems}
            display={moneyDisplay}
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
        <div
          onPointerEnter={() => {
            void prefetchFinanceCategories(queryClient)
          }}
          onFocusCapture={() => {
            void prefetchFinanceCategories(queryClient)
          }}
        >
          <SummaryItem
            title="Categorías"
            description="Organiza gastos e ingresos"
            icon={TagsIcon}
            href={APP_ROUTES.app.financeCategories}
            showChevron
            isLast={false}
            className="px-3"
          />
        </div>
        <div
          onPointerEnter={() => {
            if (emailSyncEnabled) {
              void prefetchFinanceSync(queryClient)
            }
          }}
          onFocusCapture={() => {
            if (emailSyncEnabled) {
              void prefetchFinanceSync(queryClient)
            }
          }}
        >
          <SummaryItem
            title="Correos"
            description="Gmail y notificaciones de bancos"
            icon={MailIcon}
            href={APP_ROUTES.app.financeSync}
            showChevron
            isLast
            className="px-3"
          />
        </div>
      </SettingsSection>

      <Button
        type="button"
        size="icon-lg"
        aria-label="Nueva institución"
        className="fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 size-14 rounded-full shadow-xl md:bottom-8"
        onClick={() => setOpenInstitutionSheet(true, null)}
      >
        <PlusIcon className="size-6" />
      </Button>

      <InstitutionSheet
        open={openInstitutionSheet}
        onOpenChange={setOpenInstitutionSheet}
        institution={null}
      />
    </>
  )
}
