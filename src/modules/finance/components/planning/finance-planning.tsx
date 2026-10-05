"use client"

import { BrandLogo } from "@/src/modules/finance/components/brand-logo";
import { FinanceListSkeleton } from "@/src/modules/finance/components/layout/finance-list-skeleton";
import { LoanSheet } from "@/src/modules/finance/components/planning/loan-sheet";
import { PlanningProgressCard } from "@/src/modules/finance/components/planning/planning-progress-card";
import { ReceivableSheet } from "@/src/modules/finance/components/planning/receivable-sheet";
import { SavingsGoalSheet } from "@/src/modules/finance/components/planning/savings-goal-sheet";
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys";
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts";
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions";
import { useLoans } from "@/src/modules/finance/hooks/use-loans";
import { useReceivables } from "@/src/modules/finance/hooks/use-receivables";
import { useSavingsGoals } from "@/src/modules/finance/hooks/use-savings-goals";
import { useSheetListEntity } from "@/src/modules/finance/hooks/use-sheet-entity";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import { formatRatePercentLabel } from "@/src/modules/finance/lib/interest-rate";
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/lib/money";
import { formatCalendarDate } from "@/src/modules/finance/lib/ledger-form";
import {
  amountRatioPct,
  joinPlanningCaption,
  visibleReceivables,
} from "@/src/modules/finance/lib/planning-lists";
import {
  FINANCE_INSTALLMENT_FREQ_LABEL,
  FINANCE_RECEIVABLE_STATUS_LABEL,
} from "@/src/modules/finance/types/entities";
import { Button } from "@/src/shared/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty";
import { SummarySection } from "@/src/shared/components/ui/summary";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params";
import {
  ChartPieIcon,
  HandshakeIcon,
  LandmarkIcon,
  PiggyBankIcon,
  PlusIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FinanceBudgetsList } from "../budgets/finance-budgets-list";

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
  currency: string,
): FinanceMoneyDisplay {
  return { ...display, currency }
}

function remainingCaption(
  current: number | null,
  target: number | null,
  display: FinanceMoneyDisplay,
  reached: string,
  prefix: string,
): string | undefined {
  if (current === null || target === null) return undefined
  const left = target - current
  if (left <= 0) return reached
  return `${prefix} ${formatFinanceMoney(left, display)}`
}

export function FinancePlanningList({
  enabled,
  display,
  defaultCurrency,
}: FinancePlanningListProps) {
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
  const accountsQuery = useAccounts(enabled)
  const institutionsQuery = useInstitutions(enabled)
  const savingsQuery = useSavingsGoals(enabled)
  const loansQuery = useLoans(enabled)
  const receivablesQuery = useReceivables(enabled)

  const accounts = accountsQuery.data ?? []
  const institutions = institutionsQuery.data ?? []
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

  return (
    <>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (isPlanningTab(value)) setTab(value)
        }}
        className="gap-6 w-full"
      >
        <TabsList className="overflow-x-auto justify-start p-1 w-full h-auto rounded-2xl">
          {PLANNING_TAB_ITEMS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="px-3 py-2 rounded-xl"
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
                    progress={amountRatioPct(goal.currentAmount, goal.targetAmount)}
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
                        "Faltan",
                      ),
                      goal.targetDate
                        ? `Para ${formatCalendarDate(goal.targetDate)}`
                        : undefined,
                    )}
                    onPress={() => setOpenSavingsSheet(true, goal.id)}
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
                    Crear préstamo
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              loans.map((loan) => {
                const money = withCurrency(display, loan.currency)
                const original = parseFinanceMoney(loan.originalAmount)
                const balance = parseFinanceMoney(loan.currentBalance)
                const paidDown =
                  original !== null && balance !== null ? original - balance : null
                const moneyProgress = amountRatioPct(paidDown, original)
                const installmentProgress =
                  loan.totalInstallments > 0
                    ? (loan.paidInstallments / loan.totalInstallments) * 100
                    : null
                const paidOff = balance !== null && balance <= 0
                const institution = (institutionsQuery.data ?? []).find(
                  (item) => item.id === loan.institutionId,
                )
                return (
                  <PlanningProgressCard
                    key={loan.id}
                    title={loan.lenderName}
                    leading={
                      <BrandLogo
                        name={institution?.name ?? loan.lenderName}
                        logoUrl={institution?.logoUrl}
                        size={28}
                      />
                    }
                    tone={paidOff ? "success" : "warning"}
                    badge={{
                      label: paidOff ? "Saldado" : "Activo",
                      variant: paidOff ? "success" : "warning",
                    }}
                    progress={moneyProgress ?? installmentProgress}
                    currentHint="Saldo"
                    currentLabel={formatFinanceMoney(loan.currentBalance, money)}
                    targetHint="Original"
                    targetLabel={formatFinanceMoney(loan.originalAmount, money)}
                    caption={joinPlanningCaption(
                      `${loan.paidInstallments}/${loan.totalInstallments} cuotas`,
                      FINANCE_INSTALLMENT_FREQ_LABEL[loan.installmentFreq],
                      formatRatePercentLabel(loan.interestRate),
                      loan.nextDueDate
                        ? `Vence ${formatCalendarDate(loan.nextDueDate)}`
                        : undefined,
                    )}
                    onPress={() => setOpenLoanSheet(true, loan.id)}
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
                        "Resta",
                      ),
                      item.dueDate
                        ? `Vence ${formatCalendarDate(item.dueDate)}`
                        : undefined,
                    )}
                    onPress={() => setOpenReceivableSheet(true, item.id)}
                  />
                )
              })
            )}
          </SummarySection>
        </TabsContent>

        <TabsContent value="budgets">
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
    </>
  )
}
