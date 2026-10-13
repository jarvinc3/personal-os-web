"use client"

import type { UpcomingCardCycle } from "@/src/modules/finance/shared/lib/card-statement-cycle"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { CardStatementSheet } from "@/src/modules/finance/cards/components/card-statement-sheet"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  FINANCE_CARD_STATEMENT_STATUS_LABEL,
  type FinanceCardStatement,
  type FinanceCardStatementStatus,
} from "@/src/modules/finance/shared/types/entities"
import { Badge, badgeVariants } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { cn } from "@/src/shared/lib/utils"
import type { VariantProps } from "class-variance-authority"
import { CalendarIcon, CalendarPlusIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

const STATEMENT_CARD_CLASS =
  "flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"

const STATEMENT_STATUS_VARIANT: Record<
  FinanceCardStatementStatus,
  BadgeVariant
> = {
  OPEN: "info",
  CLOSED: "info",
  PARTIAL: "warning",
  MINIMUM_PAID: "warning",
  PAID: "success",
  OVERDUE: "destructive",
}

type CardStatementsSectionProps = {
  cardId: string
  statements: readonly FinanceCardStatement[]
  upcomingCycle: UpcomingCardCycle | null
  display: FinanceMoneyDisplay
  isPending: boolean
  emptyLabel: string
  emptyDescription: string
  onCreate: () => void
  createLabel: string
}

function CycleDates({
  cycleEnd,
  dueDate,
}: {
  cycleEnd: string
  dueDate: string | null
}) {
  return (
    <div className="flex gap-3">
      <CalendarIcon className="size-5 shrink-0 text-muted-foreground" />
      <div>
        <p className="font-semibold">Corte {formatCalendarDate(cycleEnd)}</p>
        <p className="text-sm text-muted-foreground">
          {dueDate ? `Vence ${formatCalendarDate(dueDate)}` : "Sin vencimiento"}
        </p>
      </div>
    </div>
  )
}

function statementProgress(statement: FinanceCardStatement): number {
  const closing = parseFinanceMoney(statement.closingBalance)
  if (closing === null || closing <= 0) {
    return 100
  }
  const paid = parseFinanceMoney(statement.paidAmount) ?? 0
  return Math.min(100, Math.max(0, (paid / closing) * 100))
}

export function CardStatementsSection({
  cardId,
  statements,
  upcomingCycle,
  display,
  isPending,
  emptyLabel,
  emptyDescription,
  onCreate,
  createLabel,
}: CardStatementsSectionProps) {
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(
    null
  )
  const [statementEditing, setStatementEditing] = useState(false)
  return (
    <>
      <AsyncRegion
        pending={isPending}
        pendingFallback={
          <div className="flex flex-col gap-3">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-border bg-muted/40"
              />
            ))}
          </div>
        }
        empty={statements.length === 0 && upcomingCycle === null}
        emptyFallback={
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarIcon />
              </EmptyMedia>
              <EmptyTitle>{emptyLabel}</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onCreate}>
                <PlusIcon />
                {createLabel}
              </Button>
            </EmptyContent>
          </Empty>
        }
      >
        <div className="flex flex-col gap-3">
          {upcomingCycle ? (
            <article className={cn(STATEMENT_CARD_CLASS, "border-dashed")}>
              <div className="flex items-start justify-between gap-3">
                <CycleDates
                  cycleEnd={upcomingCycle.cycleEnd}
                  dueDate={upcomingCycle.dueDate}
                />
                <Badge variant="outline">En curso</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                El balance se calcula cuando el ciclo cierre.
              </p>
            </article>
          ) : null}
          {statements.map((statement) => {
            const moneyDisplay = { ...display, currency: statement.currency }
            return (
              <button
                key={statement.id}
                type="button"
                className={cn(STATEMENT_CARD_CLASS, "text-left")}
                onClick={() => {
                  setStatementEditing(false)
                  setSelectedStatementId(statement.id)
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <CycleDates
                    cycleEnd={statement.cycleEnd}
                    dueDate={statement.dueDate}
                  />
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
                    Pagado{" "}
                    {formatFinanceMoney(statement.paidAmount, moneyDisplay)}
                  </span>
                  <span>
                    Restante{" "}
                    {formatFinanceMoney(statement.remaining, moneyDisplay)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>
                    Mínimo{" "}
                    {formatFinanceMoney(statement.minimumPayment, moneyDisplay)}
                  </span>
                  <span>
                    {statement.minimumSource === "ESTIMATED"
                      ? "Mínimo estimado"
                      : "Mínimo del banco"}
                  </span>
                </div>
              </button>
            )
          })}
          {statements.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setStatementEditing(true)
                setSelectedStatementId(statements[0]?.id ?? null)
              }}
            >
              <CalendarPlusIcon className="size-4 shrink-0" />
              Registrar corte
            </Button>
          ) : null}
        </div>
      </AsyncRegion>
      <CardStatementSheet
        open={selectedStatementId !== null}
        onOpenChange={(next) => {
          if (!next) {
            setSelectedStatementId(null)
          }
        }}
        cardId={cardId}
        statementId={selectedStatementId}
        display={display}
        defaultEditing={statementEditing}
      />
    </>
  )
}
