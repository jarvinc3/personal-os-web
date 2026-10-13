"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import {
  useCardStatementDetail,
  useUpdateCardStatement,
} from "@/src/modules/finance/shared/hooks/use-card-statements"
import type { UpdateCardStatementBody } from "@/src/modules/finance/shared/hooks/use-card-statements"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { joinPlanningCaption } from "@/src/modules/finance/shared/lib/planning-lists"
import {
  FINANCE_CARD_STATEMENT_STATUS_LABEL,
  type FinanceCardStatementMovement,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { Button } from "@/src/shared/components/ui/button"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { appToast } from "@/src/shared/lib/app-toast"
import { CalendarIcon, XIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

type CardStatementSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardId: string
  statementId: string | null
  display: FinanceMoneyDisplay
  /** Abre el formulario de captura al entrar, sin pasar por "Registrar corte". */
  defaultEditing?: boolean
}

function movementTitle(movement: FinanceCardStatementMovement): string {
  return movement.merchant ?? movement.description ?? "Movimiento"
}

function MovementList({
  movements,
  display,
  emptyLabel,
}: {
  movements: readonly FinanceCardStatementMovement[]
  display: FinanceMoneyDisplay
  emptyLabel: string
}) {
  if (movements.length === 0) {
    return <p className="px-1 text-sm text-muted-foreground">{emptyLabel}</p>
  }
  return (
    <div className="rounded-2xl border border-border bg-card">
      {movements.map((movement, index) => (
        <SummaryItem
          key={movement.id}
          title={movementTitle(movement)}
          description={formatCalendarDate(movement.transactionDate)}
          value={formatFinanceMoney(movement.ledgerAmount, {
            ...display,
            currency: movement.ledgerCurrency,
          })}
          isLast={index === movements.length - 1}
        />
      ))}
    </div>
  )
}

export function CardStatementSheet({
  open,
  onOpenChange,
  cardId,
  statementId,
  display,
  defaultEditing = false,
}: CardStatementSheetProps) {
  const detailQuery = useCardStatementDetail(open, cardId, statementId)
  const detail = detailQuery.data
  const moneyDisplay = detail
    ? { ...display, currency: detail.statement.currency }
    : display
  const updateMutation = useUpdateCardStatement()
  const [editing, setEditing] = useState(false)
  const [minimumPayment, setMinimumPayment] = useState("")
  const [closingBalance, setClosingBalance] = useState("")
  const [dueDate, setDueDate] = useState("")

  const startEdit = useCallback(() => {
    if (!detail) {
      return
    }
    setMinimumPayment(detail.statement.minimumPayment)
    setClosingBalance(detail.statement.closingBalance)
    setDueDate(
      detail.statement.dueDate ? detail.statement.dueDate.slice(0, 10) : ""
    )
    setEditing(true)
  }, [detail])

  const saveEdit = () => {
    if (!statementId) {
      return
    }
    const body: UpdateCardStatementBody = {}
    const minimum = parseFinanceMoney(minimumPayment)
    if (minimum !== null) {
      body.minimumPayment = minimum
    }
    const closing = parseFinanceMoney(closingBalance)
    if (closing !== null) {
      body.closingBalance = closing
    }
    if (dueDate) {
      body.dueDate = dueDate
    }
    updateMutation.mutate(
      { cardId, statementId, body },
      {
        onSuccess: () => {
          appToast.success({ text1: "Corte actualizado" })
          setEditing(false)
        },
        onError: (error) =>
          appToast.error({ text1: financeErrorMessage(error) }),
      }
    )
  }

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditing(false)
      return
    }
    if (!defaultEditing || editing || !detail) {
      return
    }
    startEdit()
  }, [open, defaultEditing, editing, detail, startEdit])

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Estado de cuenta"
      description={
        detail
          ? joinPlanningCaption(
              `Corte ${formatCalendarDate(detail.statement.cycleEnd)}`,
              detail.statement.dueDate
                ? `Vence ${formatCalendarDate(detail.statement.dueDate)}`
                : undefined,
              FINANCE_CARD_STATEMENT_STATUS_LABEL[detail.statement.status]
            )
          : undefined
      }
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cerrar
          </Button>
        ),
      }}
      headerAction={
        detail && !editing ? (
          <Button type="button" variant="outline" onClick={startEdit}>
            Registrar corte
          </Button>
        ) : undefined
      }
    >
      {detailQuery.isError ? (
        <FinanceErrorState
          message={financeLoadErrorMessage(detailQuery.error)}
          onRetry={() => void detailQuery.refetch()}
          isRetrying={detailQuery.isFetching}
        />
      ) : null}

      <AsyncRegion
        pending={detailQuery.isPending}
        pendingFallback={<FinanceListSkeleton rows={4} />}
        empty={!detailQuery.isError && !detail}
        emptyFallback={
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarIcon />
              </EmptyMedia>
              <EmptyTitle>Sin detalle del corte</EmptyTitle>
              <EmptyDescription>
                Este estado de cuenta todavía no tiene movimientos.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        {detail ? (
          <div className="flex flex-col gap-5">
            {editing ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3">
                <FormTextField
                  label="Mínimo"
                  value={minimumPayment}
                  onChange={setMinimumPayment}
                />
                <FormTextField
                  label="Balance al corte"
                  value={closingBalance}
                  onChange={setClosingBalance}
                />
                <FormTextField
                  label="Vence (AAAA-MM-DD)"
                  value={dueDate}
                  onChange={setDueDate}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={updateMutation.isPending}
                    onClick={saveEdit}
                  >
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditing(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-3">
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  Balance al corte
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatFinanceMoney(
                    detail.statement.closingBalance,
                    moneyDisplay
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3">
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  Mínimo
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatFinanceMoney(
                    detail.statement.minimumPayment,
                    moneyDisplay
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3">
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  Pagado
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatFinanceMoney(
                    detail.statement.paidAmount,
                    moneyDisplay
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3">
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  Restante
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatFinanceMoney(detail.statement.remaining, moneyDisplay)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Movimientos del ciclo
              </h3>
              <MovementList
                movements={detail.movements}
                display={moneyDisplay}
                emptyLabel="Sin movimientos en este ciclo."
              />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Pagos aplicados
              </h3>
              <MovementList
                movements={detail.payments}
                display={moneyDisplay}
                emptyLabel="Sin pagos aplicados."
              />
            </div>
          </div>
        ) : null}
      </AsyncRegion>
    </BottomSheet>
  )
}
