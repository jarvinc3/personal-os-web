"use client"

import { LoanSheet } from "@/src/modules/finance/components/planning/loan-sheet"
import { ReceivableSheet } from "@/src/modules/finance/components/planning/receivable-sheet"
import { SavingsGoalSheet } from "@/src/modules/finance/components/planning/savings-goal-sheet"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useLoans } from "@/src/modules/finance/hooks/use-loans"
import { useReceivables } from "@/src/modules/finance/hooks/use-receivables"
import { useSavingsGoals } from "@/src/modules/finance/hooks/use-savings-goals"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { formatRatePercentLabel } from "@/src/modules/finance/lib/interest-rate"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import { formatFinanceMoney, parseFinanceMoney } from "@/src/modules/finance/lib/money"
import { formatPlanningDate } from "@/src/modules/finance/lib/planning-lists"
import type {
  FinanceLoan,
  FinanceReceivable,
  FinanceSavingsGoal,
} from "@/src/modules/finance/types/entities"
import { FINANCE_RECEIVABLE_STATUS_LABEL } from "@/src/modules/finance/types/entities"
import { SettingsRow } from "@/src/shared/components/layout/settings-section"
import { SummarySection } from "@/src/shared/components/layout/summary"
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
import {
  HandshakeIcon,
  LandmarkIcon,
  PiggyBankIcon,
  PlusIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

type SheetState =
  | { kind: "none" }
  | { kind: "savings"; item: FinanceSavingsGoal | null }
  | { kind: "loan"; item: FinanceLoan | null }
  | { kind: "receivable"; item: FinanceReceivable | null }

type FinancePlanningListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
  defaultCurrency: string
}

function savingsRowValue(
  goal: FinanceSavingsGoal,
  display: FinanceMoneyDisplay,
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
  display: FinanceMoneyDisplay,
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
  const [sheet, setSheet] = useState<SheetState>({ kind: "none" })
  const accountsQuery = useAccounts(enabled)
  const savingsQuery = useSavingsGoals(enabled)
  const loansQuery = useLoans(enabled)
  const receivablesQuery = useReceivables(enabled)

  const accounts = accountsQuery.data ?? []
  const savings = savingsQuery.data ?? []
  const loans = loansQuery.data ?? []
  const receivables = receivablesQuery.data ?? []

  const errorMessage = useMemo(() => {
    const error =
      savingsQuery.error ?? loansQuery.error ?? receivablesQuery.error
    return error ? financeErrorMessage(error) : null
  }, [savingsQuery.error, loansQuery.error, receivablesQuery.error])

  function closeSheet() {
    setSheet({ kind: "none" })
  }

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
            onClick={() => setSheet({ kind: "savings", item: null })}
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
              <Button onClick={() => setSheet({ kind: "savings", item: null })}>
                Crear meta
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          savings.map((goal, index) => (
            <SettingsRow
              key={goal.id}
              label={goal.name}
              value={savingsRowValue(goal, {
                ...display,
                currency: goal.currency,
              })}
              icon={PiggyBankIcon}
              onPress={() => setSheet({ kind: "savings", item: goal })}
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
            onClick={() => setSheet({ kind: "loan", item: null })}
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
              <Button onClick={() => setSheet({ kind: "loan", item: null })}>
                Crear préstamo
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          loans.map((loan, index) => (
            <SettingsRow
              key={loan.id}
              label={loan.lenderName}
              value={loanRowValue(loan, display)}
              icon={LandmarkIcon}
              onPress={() => setSheet({ kind: "loan", item: loan })}
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
            onClick={() => setSheet({ kind: "receivable", item: null })}
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
              <Button
                onClick={() => setSheet({ kind: "receivable", item: null })}
              >
                Crear cobro
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          receivables.map((item, index) => (
            <SettingsRow
              key={item.id}
              label={item.debtorName}
              value={receivableRowValue(item, display)}
              icon={HandshakeIcon}
              onPress={() => setSheet({ kind: "receivable", item })}
              isLast={index === receivables.length - 1}
            />
          ))
        )}
      </SummarySection>

      <SavingsGoalSheet
        open={sheet.kind === "savings"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        goal={sheet.kind === "savings" ? sheet.item : null}
        defaultCurrency={defaultCurrency}
      />
      <LoanSheet
        open={sheet.kind === "loan"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        loan={sheet.kind === "loan" ? sheet.item : null}
        accounts={accounts}
        defaultCurrency={defaultCurrency}
      />
      <ReceivableSheet
        open={sheet.kind === "receivable"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        receivable={sheet.kind === "receivable" ? sheet.item : null}
        defaultCurrency={defaultCurrency}
      />
    </>
  )
}
