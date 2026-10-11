"use client"

import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { LoanProgressCard } from "@/src/modules/finance/planning/components/loan-progress-card"
import { LoanSheet } from "@/src/modules/finance/planning/components/loan-sheet"
import { PlanningProgressCard } from "@/src/modules/finance/planning/components/planning-progress-card"
import { ReceivableSheet } from "@/src/modules/finance/planning/components/receivable-sheet"
import { SavingsGoalSheet } from "@/src/modules/finance/planning/components/savings-goal-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
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
import { useRouter } from "next/navigation"
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
import { SummarySection } from "@/src/shared/components/ui/summary"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import {
  ChartPieIcon,
  HandshakeIcon,
  LandmarkIcon,
  PiggyBankIcon,
  PlusIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { FinanceBudgetsList } from "@/src/modules/finance/budgets"

type FinancePlanningListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
  defaultCurrency: string
}

const PLANNING_TAB_ITEMS = [
  { value: "savings", label: "Ahorros", icon: PiggyBankIcon },
  { value: "loans", label: "Préstamos", icon: LandmarkIcon },
  { value: "receivables", label: "Cobros", icon: HandshakeIcon },
  { value: "budgets", label: "Presupuestos", icon: ChartPieIcon },
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
  const router = useRouter()
  const {
    open: openSavingsSheet,
    sheetId: savingsSheetId,
    setOpen: setOpenSavingsSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.savings)
  const {
    open: openLoanSheet,
    sheetId: loanSheetId,
    setOpen: setOpenLoanSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.loan)
  const {
    open: openReceivableSheet,
    sheetId: receivableSheetId,
    setOpen: setOpenReceivableSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.receivable)
  const { setOpen: setOpenBudgetSheet } = useSheetParam(
    FINANCE_SHEET_KEYS.budget
  )
  const accountsQuery = useAccounts(enabled)
  const categoriesQuery = useCategories(enabled)
  const institutionsQuery = useInstitutions(enabled)
  const savingsQuery = useSavingsGoals(enabled)
  const loansQuery = useLoans(enabled)
  const receivablesQuery = useReceivables(enabled)

  const accounts = accountsQuery.data ?? []
  const institutions = institutionsQuery.data ?? []
  const hasExpenseCategories =
    filterCategoriesByType(categoriesQuery.data ?? [], "EXPENSE").length > 0
  const savings = savingsQuery.data ?? []
  const loans = loansQuery.data ?? []
  const receivables = receivablesQuery.data ?? []
  const listedReceivables = visibleReceivables(receivables)

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
  const editingLoan = useSheetListEntity(
    openLoanSheet,
    loanSheetId,
    loansQuery.data,
    loansQuery.isPending,
    setOpenLoanSheet
  )
  const editingReceivable = useSheetListEntity(
    openReceivableSheet,
    receivableSheetId,
    receivablesQuery.data,
    receivablesQuery.isPending,
    setOpenReceivableSheet
  )
  const [tab, setTab] = useState<PlanningTab>("savings")

  function openCreate(next: PlanningTab) {
    setTab(next)
    if (next === "savings") {
      setOpenSavingsSheet(true, null)
    } else if (next === "loans") {
      setOpenLoanSheet(true, null)
    } else if (next === "receivables") {
      setOpenReceivableSheet(true, null)
    } else {
      setOpenBudgetSheet(true, null)
    }
  }

  return (
    <>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (isPlanningTab(value)) {
            setTab(value)
          }
        }}
        className="w-full gap-6"
      >
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-2xl p-1">
          {PLANNING_TAB_ITEMS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-xl px-3 py-2"
            >
              <Icon data-icon="inline-start" />
              <span className="sr-only md:not-sr-only">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="savings">
          <SummarySection
            title="Ahorros"
            icon={PiggyBankIcon}
            right={
              <Button
                size="sm"
                variant="ghost"
                disabled={!enabled}
                onClick={() => setOpenSavingsSheet(true, null)}
              >
                <PlusIcon />
                Crear meta
              </Button>
            }
          >
            {savingsQuery.isPending && !savingsQuery.data ? (
              <FinanceListSkeleton />
            ) : savings.length === 0 ? (
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
            ) : (
              savings.map((goal) => {
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
                    onPress={() =>
                      router.push(APP_ROUTES.app.financeSavingsGoal(goal.id))
                    }
                  />
                )
              })
            )}
          </SummarySection>
        </TabsContent>

        <TabsContent value="loans">
          <SummarySection
            title="Préstamos"
            icon={LandmarkIcon}
            right={
              <Button
                size="sm"
                variant="ghost"
                disabled={!enabled}
                onClick={() => setOpenLoanSheet(true, null)}
              >
                <PlusIcon />
                Crear préstamo
              </Button>
            }
          >
            {loansQuery.isPending && !loansQuery.data ? (
              <FinanceListSkeleton />
            ) : loans.length === 0 ? (
              <Empty className="py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <LandmarkIcon />
                  </EmptyMedia>
                  <EmptyTitle>Aún no hay préstamos</EmptyTitle>
                  <EmptyDescription>
                    Registra cuotas, tasa anual y próximo vencimiento.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setOpenLoanSheet(true, null)}>
                    <PlusIcon className="size-4 shrink-0" />
                    Crear préstamo
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              loans.map((loan) => {
                const institution = (institutionsQuery.data ?? []).find(
                  (item) => item.id === loan.institutionId
                )
                return (
                  <LoanProgressCard
                    key={loan.id}
                    loan={loan}
                    display={display}
                    institution={institution}
                    onPress={() =>
                      router.push(APP_ROUTES.app.financeLoan(loan.id))
                    }
                  />
                )
              })
            )}
          </SummarySection>
        </TabsContent>

        <TabsContent value="receivables">
          <SummarySection
            title="Cobros"
            icon={HandshakeIcon}
            right={
              <Button
                size="sm"
                variant="ghost"
                disabled={!enabled}
                onClick={() => setOpenReceivableSheet(true, null)}
              >
                <PlusIcon />
                Crear cobro
              </Button>
            }
          >
            {receivablesQuery.isPending && !receivablesQuery.data ? (
              <FinanceListSkeleton />
            ) : listedReceivables.length === 0 ? (
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
            ) : (
              listedReceivables.map((item) => {
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
                    onPress={() =>
                      router.push(APP_ROUTES.app.financeReceivable(item.id))
                    }
                  />
                )
              })
            )}
          </SummarySection>
        </TabsContent>

        <TabsContent value="budgets" keepMounted>
          <FinanceBudgetsList enabled={enabled} display={display} />
        </TabsContent>
      </Tabs>

      <SavingsGoalSheet
        open={openSavingsSheet}
        onOpenChange={setOpenSavingsSheet}
        pending={Boolean(savingsSheetId) && !editingGoal}
        goal={editingGoal}
        defaultCurrency={defaultCurrency}
      />

      <LoanSheet
        open={openLoanSheet}
        onOpenChange={setOpenLoanSheet}
        pending={Boolean(loanSheetId) && !editingLoan}
        loan={editingLoan}
        accounts={accounts}
        institutions={institutions}
        defaultCurrency={defaultCurrency}
      />

      <ReceivableSheet
        open={openReceivableSheet}
        onOpenChange={setOpenReceivableSheet}
        pending={Boolean(receivableSheetId) && !editingReceivable}
        receivable={editingReceivable}
        defaultCurrency={defaultCurrency}
      />

      <ExpandableFab
        label="Crear en planificación"
        actions={[
          {
            icon: <ChartPieIcon className="size-5" />,
            label: "Presupuesto",
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
            icon: <LandmarkIcon className="size-5" />,
            label: "Préstamo",
            onClick: () => openCreate("loans"),
            disabled: !enabled,
            color: "bg-amber-600",
          },
          {
            icon: <PiggyBankIcon className="size-5" />,
            label: "Ahorro",
            onClick: () => openCreate("savings"),
            disabled: !enabled,
            color: "bg-emerald-600",
          },
        ]}
      />
    </>
  )
}
