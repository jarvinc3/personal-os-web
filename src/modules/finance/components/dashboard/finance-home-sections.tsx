"use client"

import { TransactionStatusMark } from "@/src/modules/finance/components/transactions/transaction-status-mark";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import type { FinanceFrequentExpense } from "@/src/modules/finance/lib/finance-home";
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/lib/money";
import {
  isTransferTransaction,
  transactionInstrumentLabel,
  transferDirectionLabel,
} from "@/src/modules/finance/lib/transactions-query";
import type {
  FinanceCategory,
  FinanceTransaction,
} from "@/src/modules/finance/types/entities";
import { Button } from "@/src/shared/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { cn } from "@/src/shared/lib/utils";
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowRight,
  ArrowUpDown,
  ArrowUpRight,
  ArrowUpRightIcon,
  LandmarkIcon,
  Plus,
} from "lucide-react";
import Link from "next/link";

type QueryState = {
  isPending: boolean
  isError: boolean
  error: unknown
}

type FrequentExpensesSectionProps = {
  expenses: FinanceFrequentExpense[]
  query: QueryState
}

export function FrequentExpensesSection({
  expenses,
  query,
}: FrequentExpensesSectionProps) {
  return (
    <SummarySection
      title="Gastos frecuentes"
      icon={ArrowUpRight}
      right={
        <Button asChild variant="ghost" size="sm">
          <Link href={APP_ROUTES.app.financeTransactions}>
            <Plus size={12} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Agregar
            </span>
          </Link>
        </Button>
      }
    >
      {query.isPending ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : query.isError ? (
        <p className="text-sm text-destructive">
          {financeErrorMessage(query.error)}
        </p>
      ) : expenses.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LandmarkIcon />
            </EmptyMedia>
            <EmptyTitle>Todavía no hay gastos frecuentes</EmptyTitle>
            <EmptyDescription>
              Aparecerán cuando registres gastos confirmados con comercio o
              descripción.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-1">
          {expenses.map((expense) => (
            <Link
              key={expense.key}
              href={APP_ROUTES.app.financeTransactions}
              className="flex w-20 shrink-0 flex-col items-center gap-2 rounded-xl p-1 text-center transition-opacity hover:opacity-75"
            >
              <span className="relative">
                <span
                  className="flex size-14 items-center justify-center rounded-full bg-muted text-base font-semibold"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${expense.color} 18%, transparent)`,
                  }}
                >
                  {expense.icon ?? expense.initials}
                </span>
                <span
                  className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-card"
                  style={{ backgroundColor: expense.color }}
                />
              </span>
              <span className="w-full truncate text-xs text-foreground">
                {expense.categoryName}
              </span>
            </Link>
          ))}
        </div>
      )}
    </SummarySection>
  )
}

type RecentTransactionsSectionProps = {
  transactions: FinanceTransaction[]
  categories: FinanceCategory[]
  display: FinanceMoneyDisplay
  query: QueryState
}

function signedAmount(
  transaction: FinanceTransaction,
  display: FinanceMoneyDisplay
): string {
  const parsed = parseFinanceMoney(transaction.amount)
  const formatted = formatFinanceMoney(
    parsed === null ? null : Math.abs(parsed),
    { ...display, currency: transaction.currency }
  )
  if (isTransferTransaction(transaction)) return formatted
  if (transaction.type === "DEBIT") return `− ${formatted}`
  if (transaction.type === "CREDIT") return `+ ${formatted}`
  return formatted
}

export function RecentTransactionsSection({
  transactions,
  categories,
  display,
  query,
}: RecentTransactionsSectionProps) {
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const)
  )

  return (
    <SummarySection
      title="Transacciones recientes"
      icon={ArrowUpDown}
      right={
        <Button asChild variant="ghost" size="sm">
          <Link href={APP_ROUTES.app.financeTransactions}>
            <span className="text-xs font-medium text-muted-foreground">
              Ver todas
            </span>
            <ArrowRight size={12} className="text-muted-foreground" />
          </Link>
        </Button>
      }
    >
      {query.isPending ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : query.isError ? (
        <p className="text-sm text-destructive">
          {financeErrorMessage(query.error)}
        </p>
      ) : transactions.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LandmarkIcon />
            </EmptyMedia>
            <EmptyTitle>Todavía no hay transacciones recientes</EmptyTitle>
            <EmptyDescription>
              Cuando registres movimientos aparecerán aquí los más recientes.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col">
          {transactions.map((transaction, index) => {
            const isTransfer = isTransferTransaction(transaction)
            const category = transaction.categoryId
              ? categoryById.get(transaction.categoryId)
              : undefined
            const parent = category?.parentId
              ? categoryById.get(category.parentId)
              : undefined
            const icon = isTransfer
              ? undefined
              : category?.icon?.trim() || parent?.icon?.trim()
            const color = isTransfer
              ? "#3B82F6"
              : category?.color?.trim() || parent?.color?.trim() || "#64748B"
            const title = isTransfer
              ? transferDirectionLabel(transaction)
              : (transaction.merchant ??
                transaction.description ??
                transaction.accountName ??
                "Movimiento")

            return (
              <SummaryItem
                key={transaction.id}
                href={APP_ROUTES.app.financeTransactions}
                title={title}
                description={
                  transactionInstrumentLabel(transaction) ?? undefined
                }
                leading={
                  icon ? (
                    <span>{icon}</span>
                  ) : isTransfer ? (
                    <ArrowLeftRightIcon className="size-5 text-info" />
                  ) : transaction.type === "DEBIT" ? (
                    <ArrowDownLeftIcon className="size-5 text-destructive" />
                  ) : transaction.type === "CREDIT" ? (
                    <ArrowUpRightIcon className="size-5 text-success" />
                  ) : null
                }
                accentColor={color}
                value={
                  <span
                    className={cn(
                      !isTransfer &&
                        transaction.type === "DEBIT" &&
                        "text-destructive",
                      !isTransfer &&
                        transaction.type === "CREDIT" &&
                        "text-success"
                    )}
                  >
                    {signedAmount(transaction, display)}
                  </span>
                }
                trailing={<TransactionStatusMark status={transaction.status} />}
                isLast={index === transactions.length - 1}
              />
            )
          })}
        </div>
      )}
    </SummarySection>
  )
}
