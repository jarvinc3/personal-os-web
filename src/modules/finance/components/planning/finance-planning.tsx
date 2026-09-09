"use client"

import { LoanSheet } from "@/src/modules/finance/components/planning/loan-sheet"
import { ReceivableSheet } from "@/src/modules/finance/components/planning/receivable-sheet"
import { SavingsGoalSheet } from "@/src/modules/finance/components/planning/savings-goal-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions"
import { useLoans } from "@/src/modules/finance/hooks/use-loans"
import { useReceivables } from "@/src/modules/finance/hooks/use-receivables"
import { useSavingsGoals } from "@/src/modules/finance/hooks/use-savings-goals"
import { useSheetListEntity } from "@/src/modules/finance/hooks/use-sheet-entity"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { formatRatePercentLabel } from "@/src/modules/finance/lib/interest-rate"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/lib/money"
import { formatPlanningDate } from "@/src/modules/finance/lib/planning-lists"
import type {
  FinanceLoan,
  FinanceReceivable,
  FinanceSavingsGoal,
} from "@/src/modules/finance/types/entities"
import { FINANCE_RECEIVABLE_STATUS_LABEL } from "@/src/modules/finance/types/entities"
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
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import {
  HandshakeIcon,
  LandmarkIcon,
  PiggyBankIcon,
  PlusIcon,
} from "lucide-react"
import { useMemo } from "react"
import { FinanceBudgetsList } from "../budgets/finance-budgets-list"

type FinancePlanningListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
  defaultCurrency: string
}

function savingsRowValue(
  goal: FinanceSavingsGoal,
  display: FinanceMoneyDisplay
): string {
  const current = formatFinanceMoney(goal.currentAmount, display)
  const target = formatFinanceMoney(goal.targetAmount, display)
  const status = goal.isCompleted ? "Completada" : "En curso"
  return `${current} / ${target} · ${status}`
}

function loanRowValue(loan: FinanceLoan, display: FinanceMoneyDisplay): string {
  const balance = formatFinanceMoney(loan.currentBalance, {
    ...display,
    currency: loan.currency,
  })
  const rate = formatRatePercentLabel(loan.interestRate)
  const due = formatPlanningDate(loan.nextDueDate)
  return `${balance} · ${rate}${due ? ` · ${due}` : ""}`
}

function receivableRowValue(
  item: FinanceReceivable,
  display: FinanceMoneyDisplay
): string {
  const amount = formatFinanceMoney(item.amount, {
    ...display,
    currency: item.currency,
  })
  const paid = parseFinanceMoney(item.paidAmount)
  const total = parseFinanceMoney(item.amount)
  const remaining =
    paid !== null && total !== null
      ? formatFinanceMoney(total - paid, {
          ...display,
          currency: item.currency,
        })
      : "—"
  const status = FINANCE_RECEIVABLE_STATUS_LABEL[item.status] ?? item.status
  return `${amount} · ${status} · resta ${remaining}`
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

  return (
    <>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

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
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
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
          savings.map((goal, index) => (
            <SummaryItem
              key={goal.id}
              title={goal.name}
              value={savingsRowValue(goal, {
                ...display,
                currency: goal.currency,
              })}
              icon={PiggyBankIcon}
              onPress={() => setOpenSavingsSheet(true, goal.id)}
              isLast={index === savings.length - 1}
            />
          ))
        )}
      </SummarySection>

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
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
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
          loans.map((loan, index) => (
            <SummaryItem
              key={loan.id}
              title={loan.lenderName}
              value={loanRowValue(loan, display)}
              icon={LandmarkIcon}
              onPress={() => setOpenLoanSheet(true, loan.id)}
              isLast={index === loans.length - 1}
            />
          ))
        )}
      </SummarySection>

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
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : receivables.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HandshakeIcon />
              </EmptyMedia>
              <EmptyTitle>Aún no hay cobros</EmptyTitle>
              <EmptyDescription>
                Lo que te deben. Pagado o cancelado, sin eliminar.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setOpenReceivableSheet(true, null)}>
                Crear cobro
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          receivables.map((item, index) => (
            <SummaryItem
              key={item.id}
              title={item.debtorName}
              value={receivableRowValue(item, display)}
              icon={HandshakeIcon}
              onPress={() => setOpenReceivableSheet(true, item.id)}
              isLast={index === receivables.length - 1}
            />
          ))
        )}
      </SummarySection>

      <FinanceBudgetsList enabled={enabled} display={display} />

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
