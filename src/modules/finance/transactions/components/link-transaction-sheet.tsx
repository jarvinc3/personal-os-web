"use client"

import { useLoanInstallments } from "@/src/modules/finance/shared/hooks/use-loan-installments"
import { useLoans } from "@/src/modules/finance/shared/hooks/use-loans"
import { LoanProgressCard } from "@/src/modules/finance/loans"
import { ReceivableCard } from "@/src/modules/finance/receivables"
import { GoalCard } from "@/src/modules/finance/savings-goals"
import { useReceivables } from "@/src/modules/finance/shared/hooks/use-receivables"
import { useSavingsGoals } from "@/src/modules/finance/shared/hooks/use-savings-goals"
import {
  useLinkTransaction,
  type LinkTransactionBody,
} from "@/src/modules/finance/shared/hooks/use-transaction-link"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { appToast } from "@/src/shared/lib/app-toast"
import { ChevronLeftIcon } from "lucide-react"
import { useState } from "react"

const LINK_TABS = {
  installment: "installment",
  receivable: "receivable",
  goal: "goal",
} as const

type LinkTab = (typeof LINK_TABS)[keyof typeof LINK_TABS]

type LinkTransactionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string
  display: FinanceMoneyDisplay
  onLinked: () => void
}

export function LinkTransactionSheet({
  open,
  onOpenChange,
  transactionId,
  display,
  onLinked,
}: LinkTransactionSheetProps) {
  const [tab, setTab] = useState<LinkTab>(LINK_TABS.installment)
  const [loanId, setLoanId] = useState<string | null>(null)
  const loansQuery = useLoans(open)
  const receivablesQuery = useReceivables(open)
  const goalsQuery = useSavingsGoals(open)
  const installmentsQuery = useLoanInstallments(open && Boolean(loanId), loanId)
  const link = useLinkTransaction()

  const loans = (loansQuery.data ?? []).filter(
    (loan) => loan.isActive && loan.paidInstallments < loan.totalInstallments
  )
  const selectedLoan = loans.find((loan) => loan.id === loanId) ?? null
  const installments = infiniteListItems(installmentsQuery.data).filter(
    (installment) => installment.status !== "PAID"
  )
  const receivables = (receivablesQuery.data ?? []).filter(
    (receivable) =>
      receivable.status === "PENDING" || receivable.status === "PARTIAL"
  )
  const goals = (goalsQuery.data ?? []).filter((goal) => !goal.isCompleted)

  function submit(body: LinkTransactionBody) {
    link.mutate(
      { transactionId, body },
      {
        onSuccess: () => {
          appToast.success({ text1: "Movimiento vinculado" })
          onOpenChange(false)
          onLinked()
        },
        onError: (error) =>
          appToast.error({ text1: financeErrorMessage(error) }),
      }
    )
  }

  function renderInstallmentTargets() {
    if (selectedLoan) {
      if (installments.length === 0 && !installmentsQuery.hasNextPage) {
        return (
          <p className="text-sm text-muted-foreground">
            Sin cuotas pendientes.
          </p>
        )
      }
      return (
        <>
          {installments.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card">
              {installments.map((installment, index) => (
                <SummaryItem
                  key={installment.id}
                  title={`Cuota ${installment.installmentNo}`}
                  description={`Vence ${formatCalendarDate(installment.dueDate, display.locale)}`}
                  value={formatFinanceMoney(installment.amount, {
                    ...display,
                    currency: selectedLoan.currency,
                  })}
                  onPress={() =>
                    submit({
                      kind: "LOAN_INSTALLMENT",
                      loanId: selectedLoan.id,
                      installmentId: installment.id,
                    })
                  }
                  isLast={index === installments.length - 1}
                />
              ))}
            </div>
          ) : null}
          <InfiniteListSentinel
            hasNextPage={installmentsQuery.hasNextPage}
            isFetchingNextPage={installmentsQuery.isFetchingNextPage}
            onLoadMore={() => void installmentsQuery.fetchNextPage()}
          />
        </>
      )
    }
    if (loans.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          Sin préstamos con cuotas pendientes.
        </p>
      )
    }
    return (
      <div className="rounded-2xl border border-border bg-card">
        {loans.map((loan) => (
          <LoanProgressCard
            key={loan.id}
            loan={loan}
            display={display}
            variant="compact"
            selected={loan.id === loanId}
            onPress={() => setLoanId(loan.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Vincular movimiento"
      description="No crea dinero nuevo: registra el efecto en la planificación."
    >
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as LinkTab)
          setLoanId(null)
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value={LINK_TABS.installment}>Cuota</TabsTrigger>
          <TabsTrigger value={LINK_TABS.receivable}>Cobro</TabsTrigger>
          <TabsTrigger value={LINK_TABS.goal}>Meta</TabsTrigger>
        </TabsList>

        <TabsContent
          value={LINK_TABS.installment}
          className="flex flex-col gap-2 pt-3"
        >
          {selectedLoan ? (
            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => setLoanId(null)}
            >
              <ChevronLeftIcon className="size-4 shrink-0" />
              {selectedLoan.lenderName}
            </Button>
          ) : null}

          {renderInstallmentTargets()}
        </TabsContent>

        <TabsContent
          value={LINK_TABS.receivable}
          className="flex flex-col gap-2 pt-3"
        >
          {receivables.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin cobros abiertos.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {receivables.map((receivable) => (
                <ReceivableCard
                  key={receivable.id}
                  source={{ kind: "receivable", receivable }}
                  display={display}
                  variant="compact"
                  onPress={() =>
                    submit({
                      kind: "RECEIVABLE_PAYMENT",
                      receivableId: receivable.id,
                    })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value={LINK_TABS.goal}
          className="flex flex-col gap-2 pt-3"
        >
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin metas abiertas.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  display={display}
                  variant="compact"
                  onPress={() =>
                    submit({
                      kind: "SAVINGS_CONTRIBUTION",
                      goalId: goal.id,
                    })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </BottomSheet>
  )
}
