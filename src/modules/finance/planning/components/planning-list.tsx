"use client"

import { FinanceBudgetsList } from "@/src/modules/finance/budgets"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import {
  debtorFirstName,
  formatSharePendingTotals,
  ReceivableShareSheet,
  ReceivableSheet,
  shareSelectionDebtor,
  shareSelectionTotals,
  shareableReceivables,
} from "@/src/modules/finance/receivables"
import { SavingsGoalSheet } from "@/src/modules/finance/savings-goals"
import { financeSectionTitle } from "@/src/modules/finance/shared/constants/nav"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useLoans } from "@/src/modules/finance/shared/hooks/use-loans"
import { useReceivables } from "@/src/modules/finance/shared/hooks/use-receivables"
import { useSavingsGoals } from "@/src/modules/finance/shared/hooks/use-savings-goals"
import { useSheetListEntity } from "@/src/modules/finance/shared/hooks/use-sheet-entity"
import { filterCategoriesByType } from "@/src/modules/finance/shared/lib/category-tree"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { visibleReceivables } from "@/src/modules/finance/shared/lib/planning-lists"
import { PlanningCreateFab } from "@/src/modules/finance/planning/components/planning-create-fab"
import { PlanningLoansTab } from "@/src/modules/finance/planning/components/planning-loans-tab"
import { PlanningReceivablesTab } from "@/src/modules/finance/planning/components/planning-receivables-tab"
import { PlanningSavingsTab } from "@/src/modules/finance/planning/components/planning-savings-tab"
import { ReceivableShareBar } from "@/src/modules/finance/planning/components/receivable-share-bar"
import { useReceivableShareMode } from "@/src/modules/finance/planning/hooks/use-receivable-share-mode"
import {
  debtorSelectionIds,
  selectedReceivables,
  SHARE_ALL_LABEL,
  shareSelectionTitle,
} from "@/src/modules/finance/planning/lib/receivable-share-mode"
import {
  isPlanningTab,
  PLANNING_TAB_ITEMS,
  type PlanningTab,
} from "@/src/modules/finance/planning/lib/planning-tabs"
import { Button } from "@/src/shared/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { usePendingNavigation } from "@/src/shared/components/ui/navigation-pending"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { cn } from "@/src/shared/lib/utils"
import { UsersIcon, XIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

type FinancePlanningListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
  defaultCurrency: string
  tab: PlanningTab
  onTabChange: (tab: PlanningTab) => void
}

export function FinancePlanningList({
  enabled,
  display,
  defaultCurrency,
  tab,
  onTabChange,
}: FinancePlanningListProps) {
  const pathname = usePathname()
  const { navigate: navigateToNewLoan, isPending: isNewLoanPending } =
    usePendingNavigation()
  const {
    open: openSavingsSheet,
    sheetId: savingsSheetId,
    setOpen: setOpenSavingsSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.savings)
  const {
    open: openReceivableSheet,
    sheetId: receivableSheetId,
    setOpen: setOpenReceivableSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.receivable)
  const { open: openShareSheet, setOpen: setOpenShareSheet } = useSheetParam(
    FINANCE_SHEET_KEYS.receivableShare
  )
  const { setOpen: setOpenBudgetSheet } = useSheetParam(
    FINANCE_SHEET_KEYS.budget
  )
  const categoriesQuery = useCategories(enabled)
  const institutionsQuery = useInstitutions(enabled)
  const savingsQuery = useSavingsGoals(enabled)
  const loansQuery = useLoans(enabled)
  const receivablesQuery = useReceivables(enabled)

  const hasExpenseCategories =
    filterCategoriesByType(categoriesQuery.data ?? [], "EXPENSE").length > 0
  const savings = savingsQuery.data ?? []
  const loans = loansQuery.data ?? []
  const receivables = receivablesQuery.data ?? []
  const listedReceivables = visibleReceivables(receivables)
  const shareMode = useReceivableShareMode()
  const shareableList = shareableReceivables(listedReceivables)
  const selectedForShare = selectedReceivables(
    shareableList,
    shareMode.selectedIds
  )
  const shareDebtor = shareSelectionDebtor(selectedForShare)
  const sharePendingLabel = formatSharePendingTotals(
    shareSelectionTotals(selectedForShare, display)
  )

  usePageHeader(
    shareMode.active
      ? {
          variant: "secondary",
          title: shareSelectionTitle(selectedForShare.length),
          onBack: exitShareMode,
          backIcon: XIcon,
          backLabel: "Salir de la selección",
          actions: shareDebtor ? (
            <Button variant="ghost" size="sm" onClick={selectAllOfShareDebtor}>
              <UsersIcon className="size-4 shrink-0" aria-hidden="true" />
              {SHARE_ALL_LABEL} {debtorFirstName(shareDebtor)}
            </Button>
          ) : null,
        }
      : { title: financeSectionTitle(pathname) ?? "Finanzas" },
    [
      shareMode.active,
      selectedForShare.length,
      shareDebtor,
      openShareSheet,
      pathname,
    ]
  )

  const errorMessage = useMemo(() => {
    const error =
      savingsQuery.error ?? loansQuery.error ?? receivablesQuery.error
    return error ? financeErrorMessage(error) : null
  }, [savingsQuery.error, loansQuery.error, receivablesQuery.error])

  const editingGoal = useSheetListEntity(
    openSavingsSheet,
    savingsSheetId,
    savingsQuery.data,
    savingsQuery.isPending,
    setOpenSavingsSheet
  )
  const editingReceivable = useSheetListEntity(
    openReceivableSheet,
    receivableSheetId,
    receivablesQuery.data,
    receivablesQuery.isPending,
    setOpenReceivableSheet
  )

  function exitShareMode() {
    setOpenShareSheet(false)
    shareMode.exit()
  }

  function selectAllOfShareDebtor() {
    shareMode.selectMany(
      debtorSelectionIds({
        receivables: shareableList,
        selectedIds: shareMode.selectedIds,
      })
    )
  }

  function changeTab(next: PlanningTab) {
    onTabChange(next)
    // The selection only exists in the Cobros tab, so leaving it drops the mode.
    if (shareMode.active && next !== "receivables") {
      exitShareMode()
    }
  }

  function openCreate(next: PlanningTab) {
    onTabChange(next)
    if (next === "savings") {
      setOpenSavingsSheet(true, null)
      return
    }
    if (next === "loans") {
      navigateToNewLoan(APP_ROUTES.app.financeLoanNew)
      return
    }
    if (next === "receivables") {
      setOpenReceivableSheet(true, null)
      return
    }
    setOpenBudgetSheet(true, null)
  }

  return (
    <>
      {errorMessage ? (
        <FinanceErrorState
          message={errorMessage}
          onRetry={() => {
            void savingsQuery.refetch()
            void loansQuery.refetch()
            void receivablesQuery.refetch()
          }}
          isRetrying={
            savingsQuery.isFetching ||
            loansQuery.isFetching ||
            receivablesQuery.isFetching
          }
        />
      ) : null}

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (isPlanningTab(value)) {
            changeTab(value)
          }
        }}
        className="w-full gap-6"
      >
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-2xl p-1">
          {PLANNING_TAB_ITEMS.map(({ value, label, icon: Icon, color }) => {
            const isSelected = tab === value
            return (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-xl py-2"
              >
                <Icon
                  data-icon="inline-start"
                  className="size-5"
                  style={{ color: isSelected ? "#fff" : color }}
                />
                <span
                  className={cn("sr-only text-foreground md:not-sr-only")}
                  style={{ color: isSelected ? "#fff" : undefined }}
                >
                  {label}
                </span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="savings" className="flex flex-col gap-2">
          <PlanningSavingsTab
            goals={savings}
            pending={savingsQuery.isPending && !savingsQuery.data}
            display={display}
            onCreate={() => setOpenSavingsSheet(true, null)}
          />
        </TabsContent>

        <TabsContent value="budgets" keepMounted>
          <FinanceBudgetsList enabled={enabled} display={display} />
        </TabsContent>

        <TabsContent value="receivables" className="flex flex-col gap-2">
          <PlanningReceivablesTab
            receivables={listedReceivables}
            pending={receivablesQuery.isPending && !receivablesQuery.data}
            display={display}
            share={shareMode}
            shareDebtor={shareDebtor}
            onCreate={() => setOpenReceivableSheet(true, null)}
          />
        </TabsContent>

        <TabsContent value="loans" className="flex flex-col gap-2">
          <PlanningLoansTab
            loans={loans}
            institutions={institutionsQuery.data ?? []}
            pending={loansQuery.isPending && !loansQuery.data}
            creating={isNewLoanPending}
            display={display}
            onCreate={() => navigateToNewLoan(APP_ROUTES.app.financeLoanNew)}
          />
        </TabsContent>
      </Tabs>

      {shareMode.active ? null : (
        <PlanningCreateFab
          enabled={enabled}
          hasExpenseCategories={hasExpenseCategories}
          loanPending={isNewLoanPending}
          onOpenCreate={openCreate}
        />
      )}

      {shareMode.active ? (
        <ReceivableShareBar
          pendingLabel={sharePendingLabel}
          disabled={selectedForShare.length === 0}
          onShare={() => setOpenShareSheet(true)}
        />
      ) : null}

      <SavingsGoalSheet
        open={openSavingsSheet}
        onOpenChange={setOpenSavingsSheet}
        pending={Boolean(savingsSheetId) && !editingGoal}
        goal={editingGoal}
        defaultCurrency={defaultCurrency}
      />

      <ReceivableSheet
        open={openReceivableSheet}
        onOpenChange={setOpenReceivableSheet}
        pending={Boolean(receivableSheetId) && !editingReceivable}
        receivable={editingReceivable}
        defaultCurrency={defaultCurrency}
      />

      <ReceivableShareSheet
        key={shareDebtor ?? "sin-deudor"}
        open={openShareSheet}
        onOpenChange={setOpenShareSheet}
        receivables={selectedForShare}
        display={display}
      />
    </>
  )
}
