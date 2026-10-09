"use client"

import { formatCalendarDate } from "@/src/modules/finance/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/lib/money"
import {
  FINANCE_CARD_STATEMENT_STATUS_LABEL,
  type FinanceCardStatement,
  type FinanceCardStatementStatus,
} from "@/src/modules/finance/types/entities"
import { Badge, badgeVariants } from "@/src/shared/components/ui/badge"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import type { VariantProps } from "class-variance-authority"
import { CalendarIcon } from "lucide-react"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

const STATEMENT_STATUS_VARIANT: Record<
  FinanceCardStatementStatus,
  BadgeVariant
> = {
  PAID: "success",
  PARTIAL: "warning",
  PENDING: "info",
}

type CardStatementsSectionProps = {
  statements: readonly FinanceCardStatement[]
  display: FinanceMoneyDisplay
  isPending: boolean
  emptyLabel: string
}

function statementProgress(statement: FinanceCardStatement): number {
  const closing = parseFinanceMoney(statement.closingBalance)
  if (closing === null || closing <= 0) {
    return 100
  }
  const paid = parseFinanceMoney(statement.amountPaid) ?? 0
  return Math.min(100, Math.max(0, (paid / closing) * 100))
}

export function CardStatementsSection({
  statements,
  display,
  isPending,
  emptyLabel,
}: CardStatementsSectionProps) {
  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-2xl border border-border bg-muted/40"
          />
        ))}
      </div>
    )
  }

  if (statements.length === 0) {
    return (
      <Empty className="py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarIcon />
          </EmptyMedia>
          <EmptyTitle>{emptyLabel}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {statements.map((statement) => {
        const moneyDisplay = { ...display, currency: statement.currency }
        return (
          <article
            key={statement.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <CalendarIcon className="size-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-semibold">
                    Corte {formatCalendarDate(statement.cycleEnd)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {statement.dueDate
                      ? `Vence ${formatCalendarDate(statement.dueDate)}`
                      : "Sin vencimiento"}
                  </p>
                </div>
              </div>
              <Badge variant={STATEMENT_STATUS_VARIANT[statement.status]}>
                {FINANCE_CARD_STATEMENT_STATUS_LABEL[statement.status]}
              </Badge>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                Balance del estado
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {formatFinanceMoney(statement.closingBalance, moneyDisplay)}
              </p>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${statementProgress(statement)}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>
                Pagado {formatFinanceMoney(statement.amountPaid, moneyDisplay)}
              </span>
              <span>
                Restante {formatFinanceMoney(statement.remaining, moneyDisplay)}
              </span>
            </div>
          </article>
        )
      })}
    </div>
  )
}
