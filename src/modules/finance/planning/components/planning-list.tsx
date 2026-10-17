"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { LoanProgressCard } from "@/src/modules/finance/loans"
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
import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
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
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  amountRatioPct,
  joinPlanningCaption,
  visibleReceivables,
} from "@/src/modules/finance/shared/lib/planning-lists"
import { FINANCE_RECEIVABLE_STATUS_LABEL } from "@/src/modules/finance/shared/types/entities"
import { ReceivableShareBar } from "@/src/modules/finance/planning/components/receivable-share-bar"
import { useReceivableShareMode } from "@/src/modules/finance/planning/hooks/use-receivable-share-mode"
import {
  debtorSelectionIds,
  selectedReceivables,
  SHARE_ALL_LABEL,
  shareSelectionTitle,
} from "@/src/modules/finance/planning/lib/receivable-share-mode"
import { usePendingNavigation } from "@/src/shared/components/ui/navigation-pending"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { ExpandableFab } from "@/src/shared/components/layout/expandable-fab"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import {
  ChartPieIcon,
  CheckSquareIcon,
  HandCoinsIcon,
  HandshakeIcon,
  PiggyBankIcon,
  PlusIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { FinanceBudgetsList } from "@/src/modules/finance/budgets"
import { cn } from "@/src/shared/lib/utils"

type FinancePlanningListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
  defaultCurrency: string
}

const PLANNING_TAB_ITEMS = [
  { value: "savings", label: "Ahorros", icon: PiggyBankIcon, color: "#16a34a" },
  {
    value: "budgets",
    label: "Presupuestos",
    icon: ChartPieIcon,
    color: "#8b5cf6",
  },
  {
    value: "receivables",
    label: "Cobros",
    icon: HandshakeIcon,
    color: "#3b82f6",
  },
  { value: "loans", label: "Préstamos", icon: HandCoinsIcon, color: "#f59e0b" },
] as const

type PlanningTab = (typeof PLANNING_TAB_ITEMS)[number]["value"]

function isPlanningTab(value: unknown): value is PlanningTab {
  return PLANNING_TAB_ITEMS.some((tab) => tab.value === value)
}

function withCurrency(
  display: FinanceMoneyDisplay,
  currency: string
): FinanceMoneyDisplay {
  return { ...display, currency }
}

function remainingCaption(
  current: number | null,
  target: number | null,
  display: FinanceMoneyDisplay,
  reached: string,
  prefix: string
): string | undefined {
  if (current === null || target === null) {
    return undefined
  }
  const left = target - current
  if (left <= 0) {
    return reached
  }
  return `${prefix} ${formatFinanceMoney(left, display)}`
}

export function FinancePlanningList({
  enabled,
  display,
  defaultCurrency,
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
  const [tab, setTab] = useState<PlanningTab>(() =>
    shareMode.active ? "receivables" : "savings"
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
    setTab(next)
    // The selection only exists in the Cobros tab, so leaving it drops the mode.
    if (shareMode.active && next !== "receivables") {
      exitShareMode()
    }
  }

  function openCreate(next: PlanningTab) {
    setTab(next)
    if (next === "savings") {
      setOpenSavingsSheet(true, null)
    } else if (next === "loans") {
      navigateToNewLoan(APP_ROUTES.app.financeLoanNew)
    } else if (next === "receivables") {
      setOpenReceivableSheet(true, null)
    } else {
      setOpenBudgetSheet(true, null)
    }
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
                style={{ backgroundColor: isSelected ? color : undefined }}
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

        <TabsContent value="savings">
          <div className="flex flex-col gap-2">
            <AsyncRegion
              pending={savingsQuery.isPending && !savingsQuery.data}
              pendingFallback={<FinanceListSkeleton />}
              empty={savings.length === 0}
              emptyFallback={
                <Empty className="py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <PiggyBankIcon />
                    </EmptyMedia>
                    <EmptyTitle>Aún no hay metas</EmptyTitle>
                    <EmptyDescription>
                      Define un objetivo y ve cuánto llevas ahorrado.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={() => setOpenSavingsSheet(true, null)}>
                      <PlusIcon className="size-4 shrink-0" />
                      Crear meta
                    </Button>
                  </EmptyContent>
                </Empty>
              }
            >
              {savings.map((goal) => {
                const money = withCurrency(display, goal.currency)
                const current = parseFinanceMoney(goal.currentAmount)
                const target = parseFinanceMoney(goal.targetAmount)
                return (
                  <PlanningProgressCard
                    key={goal.id}
                    title={goal.name}
                    description={goal.description ?? undefined}
                    icon={PiggyBankIcon}
                    tone={goal.isCompleted ? "success" : "info"}
                    badge={{
                      label: goal.isCompleted ? "Completada" : "En curso",
                      variant: goal.isCompleted ? "success" : "info",
                    }}
                    progress={amountRatioPct(
                      goal.currentAmount,
                      goal.targetAmount
                    )}
                    currentHint="Ahorrado"
                    currentLabel={formatFinanceMoney(goal.currentAmount, money)}
                    targetHint="Meta"
                    targetLabel={formatFinanceMoney(goal.targetAmount, money)}
                    caption={joinPlanningCaption(
                      remainingCaption(
                        current,
                        target,
                        money,
                        "Meta alcanzada",
                        "Faltan"
                      ),
                      goal.targetDate
                        ? `Para ${formatCalendarDate(goal.targetDate)}`
                        : undefined
                    )}
                    href={APP_ROUTES.app.financeSavingsGoal(goal.id)}
                  />
                )
              })}
            </AsyncRegion>
          </div>
        </TabsContent>

        <TabsContent value="budgets" keepMounted>
          <FinanceBudgetsList enabled={enabled} display={display} />
        </TabsContent>

        <TabsContent value="receivables">
          <div className="flex flex-col gap-2">
            <AsyncRegion
              pending={receivablesQuery.isPending && !receivablesQuery.data}
              pendingFallback={<FinanceListSkeleton />}
              empty={listedReceivables.length === 0}
              emptyFallback={
                <Empty className="py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HandshakeIcon />
                    </EmptyMedia>
                    <EmptyTitle>Aún no hay cobros</EmptyTitle>
                    <EmptyDescription>
                      Lo que te deben. Archiva o borra los que ya no apliquen.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={() => setOpenReceivableSheet(true, null)}>
                      <PlusIcon className="size-4 shrink-0" />
                      Crear cobro
                    </Button>
                  </EmptyContent>
                </Empty>
              }
            >
              {shareMode.active ? (
                <p className="px-1 text-sm text-muted-foreground">
                  Toca los cobros de una misma persona para compartirlos.
                </p>
              ) : (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={shareableList.length === 0}
                    onClick={() => {
                      setTab("receivables")
                      shareMode.start()
                    }}
                  >
                    <CheckSquareIcon
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Seleccionar
                  </Button>
                </div>
              )}
              {listedReceivables.map((item) => {
                const money = withCurrency(display, item.currency)
                const paid = parseFinanceMoney(item.paidAmount)
                const total = parseFinanceMoney(item.amount)
                const tone =
                  item.status === "PAID"
                    ? "success"
                    : item.status === "PARTIAL"
                      ? "info"
                      : "warning"
                const badgeVariant =
                  item.status === "PAID"
                    ? "success"
                    : item.status === "PARTIAL"
                      ? "info"
                      : "warning"
                const dimmed =
                  shareMode.active &&
                  shareDebtor !== null &&
                  item.debtorName !== shareDebtor
                return (
                  <PlanningProgressCard
                    key={item.id}
                    title={item.debtorName}
                    description={item.description ?? undefined}
                    icon={HandshakeIcon}
                    tone={tone}
                    badge={{
                      label:
                        FINANCE_RECEIVABLE_STATUS_LABEL[item.status] ??
                        item.status,
                      variant: badgeVariant,
                    }}
                    progress={amountRatioPct(item.paidAmount, item.amount)}
                    currentHint="Cobrado"
                    currentLabel={formatFinanceMoney(item.paidAmount, money)}
                    targetHint="Total"
                    targetLabel={formatFinanceMoney(item.amount, money)}
                    caption={joinPlanningCaption(
                      remainingCaption(
                        paid,
                        total,
                        money,
                        "Cobro completo",
                        "Resta"
                      ),
                      item.dueDate
                        ? `Vence ${formatCalendarDate(item.dueDate)}`
                        : undefined
                    )}
                    href={
                      shareMode.active
                        ? undefined
                        : APP_ROUTES.app.financeReceivable(item.id)
                    }
                    onPress={
                      shareMode.active && !dimmed
                        ? () => shareMode.toggle(item.id)
                        : undefined
                    }
                    selection={
                      shareMode.active
                        ? {
                            selected: shareMode.selectedIds.includes(item.id),
                            dimmed,
                          }
                        : undefined
                    }
                    onLongPress={() =>
                      shareMode.active
                        ? shareMode.toggle(item.id)
                        : shareMode.selectOnly(item.id)
                    }
                  />
                )
              })}
            </AsyncRegion>
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <div className="flex flex-col gap-2">
            <AsyncRegion
              pending={loansQuery.isPending && !loansQuery.data}
              pendingFallback={<FinanceListSkeleton />}
              empty={loans.length === 0}
              emptyFallback={
                <Empty className="py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HandCoinsIcon />
                    </EmptyMedia>
                    <EmptyTitle>Aún no hay préstamos</EmptyTitle>
                    <EmptyDescription>
                      Registra cuotas, tasa anual y próximo vencimiento.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      onClick={() =>
                        navigateToNewLoan(APP_ROUTES.app.financeLoanNew)
                      }
                      disabled={isNewLoanPending}
                    >
                      {isNewLoanPending ? (
                        <Spinner className="size-4" />
                      ) : (
                        <PlusIcon className="size-4 shrink-0" />
                      )}
                      Crear préstamo
                    </Button>
                  </EmptyContent>
                </Empty>
              }
            >
              {loans.map((loan) => {
                const institution = (institutionsQuery.data ?? []).find(
                  (item) => item.id === loan.institutionId
                )
                return (
                  <LoanProgressCard
                    key={loan.id}
                    loan={loan}
                    display={display}
                    institution={institution}
                    href={APP_ROUTES.app.financeLoan(loan.id)}
                  />
                )
              })}
            </AsyncRegion>
          </div>
        </TabsContent>
      </Tabs>

      {shareMode.active ? null : (
        <ExpandableFab
          label="Crear en planificación"
          actions={[
            {
              icon: <PiggyBankIcon className="size-5" />,
              label: "Ahorro",
              onClick: () => openCreate("savings"),
              disabled: !enabled,
              color: "bg-emerald-600",
            },
            {
              icon: <ChartPieIcon className="size-5" />,
              label: "Presup...",
              onClick: () => openCreate("budgets"),
              disabled: !enabled || !hasExpenseCategories,
              color: "bg-violet-600",
            },
            {
              icon: <HandshakeIcon className="size-5" />,
              label: "Cobro",
              onClick: () => openCreate("receivables"),
              disabled: !enabled,
              color: "bg-blue-500",
            },
            {
              icon: isNewLoanPending ? (
                <Spinner className="size-5" />
              ) : (
                <HandCoinsIcon className="size-5" />
              ),
              label: "Prést...",
              onClick: () => openCreate("loans"),
              disabled: !enabled || isNewLoanPending,
              color: "bg-amber-600",
            },
          ]}
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
