"use client"

import { InstitutionSwapStack } from "@/src/modules/finance/products/components/institution-swap-stack"
import { ProposalsEntry } from "@/src/modules/finance/product-proposals"
import { ImportsReviewEntry } from "@/src/modules/finance/imports-review"
import { CategorySheet } from "@/src/modules/finance/catalog"
import { MerchantEditSheet } from "@/src/modules/finance/merchants/components/merchant-edit-sheet"
import { FinanceExpenseTrendBadge } from "@/src/modules/finance/shared/components/expense-trend-badge"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useBalanceSheet } from "@/src/modules/finance/shared/hooks/use-balance-sheet"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useLoans } from "@/src/modules/finance/shared/hooks/use-loans"
import { useMonthExpenseTrend } from "@/src/modules/finance/shared/hooks/use-month-expense-trend"
import {
  productDetailHref,
  reconciliationProductHref,
} from "@/src/modules/finance/reconciliation/lib/reconciliation-links"
import type {
  FinanceBalanceDrift,
  FinanceReconciliationStatusItem,
} from "@/src/modules/finance/shared/types/entities"
import {
  bankChargesQuery,
  useReconciliationStatus,
} from "@/src/modules/finance/shared/hooks/use-reconciliations"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import { bankChargesRange } from "@/src/modules/finance/shared/lib/reconciliation"
import { IrregularitiesSection } from "@/src/modules/finance/integrity"
import { recalculationPayload } from "@/src/modules/finance/shared/lib/integrity"
import {
  useFinanceIntegrity,
  useRecalculateBalance,
} from "@/src/modules/finance/shared/hooks/use-integrity"
import { monthKeyFromDate } from "@/src/modules/finance/shared/lib/month-window"
import { useSheetListEntity } from "@/src/modules/finance/shared/hooks/use-sheet-entity"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { prefetchFinanceCategories } from "@/src/modules/finance/shared/lib/finance-prefetch"
import { buildInstitutionStackItems } from "@/src/modules/finance/shared/lib/institution-stack"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { ExpandableFab } from "@/src/shared/components/fab/expandable-fab"
import { Button } from "@/src/shared/components/ui/button"
import { MissingBreakdownNotice } from "@/src/modules/finance/shared/components/layout/missing-breakdown-notice"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { appToast } from "@/src/shared/lib/app-toast"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { useQueryClient } from "@tanstack/react-query"
import {
  Building2Icon,
  ChevronRightIcon,
  LandmarkIcon,
  PlusIcon,
  StoreIcon,
  TagsIcon,
  Trash2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { FinanceHeroSection } from "@/src/modules/finance/products/components/hero-section"

type FinanceProductsListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
}

export function FinanceProductsList({
  enabled,
  display,
}: FinanceProductsListProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { trend } = useMonthExpenseTrend(enabled)
  const institutionsQuery = useInstitutions(enabled)
  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const loansQuery = useLoans(enabled)
  const categoriesQuery = useCategories(enabled)
  const balanceSheetQuery = useBalanceSheet(enabled)
  const integrityQuery = useFinanceIntegrity(enabled)
  const reconciliationStatusQuery = useReconciliationStatus(
    enabled,
    monthKeyFromDate(new Date())
  )
  const reconciliationItems = reconciliationStatusQuery.data?.items
  const recalculateBalance = useRecalculateBalance()
  const {
    open: openCategorySheet,
    sheetId: categorySheetId,
    setOpen: setOpenCategorySheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.category)
  const { open: openMerchantSheet, setOpen: setOpenMerchantSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.merchantCreate)
  const editingCategory = useSheetListEntity(
    openCategorySheet,
    categorySheetId,
    categoriesQuery.data,
    categoriesQuery.isPending,
    setOpenCategorySheet
  )

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
        cash: balanceSheetQuery.data?.cash,
        drifts: integrityQuery.data?.drifts ?? [],
        reconciliationItems: reconciliationItems ?? [],
      }),
    [
      institutionsQuery.data,
      accountsQuery.data,
      cardsQuery.data,
      loansQuery.data,
      balanceSheetQuery.data?.institutions,
      balanceSheetQuery.data?.cash,
      integrityQuery.data?.drifts,
      reconciliationItems,
    ]
  )

  const global = balanceSheetQuery.data?.global

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

  function reconciliationHref(
    item: FinanceReconciliationStatusItem
  ): string | null {
    return reconciliationProductHref({
      item,
      accounts: accountsQuery.data ?? [],
      cards: cardsQuery.data ?? [],
    })
  }

  function driftHref(drift: FinanceBalanceDrift): string | null {
    return productDetailHref({
      target: { accountId: drift.accountId, cardId: drift.cardId },
      accounts: accountsQuery.data ?? [],
      cards: cardsQuery.data ?? [],
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {errorMessage ? (
        <ErrorState
          message={errorMessage}
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
      ) : null}

      <FinanceHeroSection
        items={stackItems}
        display={moneyDisplay}
        isPending={balanceSheetQuery.isPending}
        hasData={Boolean(balanceSheetQuery.data)}
        netWorth={global?.netWorth ?? null}
        netWorthComplete={global?.status === "COMPLETE"}
        netWorthHref={APP_ROUTES.app.financeWealth}
        currencyTotals={balanceSheetQuery.data?.breakdown?.byCurrency ?? []}
      />

      {balanceSheetQuery.data && !balanceSheetQuery.data.breakdown ? (
        <MissingBreakdownNotice />
      ) : null}

      <IrregularitiesSection
        drifts={integrityQuery.data?.drifts ?? []}
        reconciliationItems={reconciliationItems ?? []}
        display={moneyDisplay}
        driftHref={driftHref}
        reconciliationHref={reconciliationHref}
        recalculatePending={recalculateBalance.isPending}
        onRecalculate={(drift) => {
          recalculateBalance.mutate(recalculationPayload(drift), {
            onSuccess: () => appToast.success({ text1: "Saldo corregido" }),
            onError: (error) =>
              appToast.error({ text1: financeErrorMessage(error) }),
          })
        }}
      />

      <div>
        <AsyncRegion
          pending={stackPending}
          pendingFallback={
            <div className="flex flex-col gap-3">
              <Skeleton
                className="h-28 border border-border bg-muted/40"
                aria-hidden
              />
              <Skeleton
                className="h-28 border border-border bg-muted/40"
                aria-hidden
              />
            </div>
          }
          empty={stackItems.length === 0}
          emptyFallback={
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Building2Icon />
                </EmptyMedia>
                <EmptyTitle>Aún no hay instituciones</EmptyTitle>
                <EmptyDescription>
                  Agrégala antes de crear una cuenta o una tarjeta. Tu cuenta de
                  Efectivo se crea sola.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  onClick={() =>
                    router.push(APP_ROUTES.app.financeInstitutionNew)
                  }
                >
                  <PlusIcon className="size-4 shrink-0" />
                  Crear institución
                </Button>
              </EmptyContent>
            </Empty>
          }
        >
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-medium text-foreground">
                Instituciones
              </p>
              {trend ? <FinanceExpenseTrendBadge trend={trend} /> : null}
            </div>
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
          </div>
        </AsyncRegion>
      </div>

      <ProposalsEntry isEnabled={enabled} />

      <ImportsReviewEntry isEnabled={enabled} />

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">Atajos</span>
        <div
          onPointerEnter={() => {
            void queryClient.prefetchQuery(
              bankChargesQuery(bankChargesRange(todayDateInput()))
            )
          }}
          onFocusCapture={() => {
            void queryClient.prefetchQuery(
              bankChargesQuery(bankChargesRange(todayDateInput()))
            )
          }}
        >
          <Item
            variant="default"
            className={"px-3"}
            render={<Link href={APP_ROUTES.app.financeBankCharges} />}
          >
            <ItemMedia variant="icon">
              <LandmarkIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{"Cargos bancarios"}</ItemTitle>
              <ItemDescription className="truncate text-xs">
                {"Ajustes al conciliar cuentas y tarjetas"}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              <LinkPendingOverlay />
            </ItemActions>
          </Item>
        </div>

        <div
          onPointerEnter={() => {
            void prefetchFinanceCategories(queryClient)
          }}
          onFocusCapture={() => {
            void prefetchFinanceCategories(queryClient)
          }}
        >
          <Item
            variant="default"
            className={"px-3"}
            render={<Link href={APP_ROUTES.app.financeCategories} />}
          >
            <ItemMedia variant="icon">
              <TagsIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{"Categorías"}</ItemTitle>
              <ItemDescription className="truncate text-xs">
                {"Organiza gastos e ingresos"}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              <LinkPendingOverlay />
            </ItemActions>
          </Item>
        </div>

        <Item
          variant="default"
          className={"px-3"}
          render={<Link href={APP_ROUTES.app.financeMerchants} />}
        >
          <ItemMedia variant="icon">
            <StoreIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Comercios"}</ItemTitle>
            <ItemDescription className="truncate text-xs">
              {"Quién recibe tu dinero y cuánto"}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            <LinkPendingOverlay />
          </ItemActions>
        </Item>

        <Item
          variant="default"
          className={"px-3"}
          render={<Link href={APP_ROUTES.app.financeRecycleBin} />}
        >
          <ItemMedia variant="icon">
            <Trash2Icon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Papelera de reciclaje"}</ItemTitle>
            <ItemDescription className="truncate text-xs">
              {"Restaura lo archivado o eliminado"}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            <LinkPendingOverlay />
          </ItemActions>
        </Item>
      </div>

      <ExpandableFab
        label="Crear en productos"
        actions={[
          {
            icon: <Building2Icon className="size-5" />,
            label: "Institución",
            onClick: () => router.push(APP_ROUTES.app.financeInstitutionNew),
            disabled: !enabled,
            color: "bg-emerald-700",
          },
          {
            icon: <StoreIcon className="size-5" />,
            label: "Comercio",
            onClick: () => setOpenMerchantSheet(true),
            disabled: !enabled,
            color: "bg-sky-700",
          },
          {
            icon: <TagsIcon className="size-5" />,
            label: "Categoría",
            onClick: () => {
              void prefetchFinanceCategories(queryClient)
              setOpenCategorySheet(true, null)
            },
            disabled: !enabled,
            color: "bg-amber-600",
          },
        ]}
      />

      <MerchantEditSheet
        mode="create"
        open={openMerchantSheet}
        onOpenChange={setOpenMerchantSheet}
        merchant={null}
      />

      <CategorySheet
        open={openCategorySheet}
        onOpenChange={setOpenCategorySheet}
        pending={Boolean(categorySheetId) && !editingCategory}
        category={editingCategory}
        categories={categoriesQuery.data ?? []}
      />
    </div>
  )
}
