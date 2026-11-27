"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { ListSkeleton } from "@/src/shared/components/feedback/list-skeleton"
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
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  fromStatementLine,
  StatementMovementRow,
} from "@/src/modules/finance/transactions"
import { SettingsSection } from "@/src/shared/components/settings/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  CalendarIcon,
  CoinsIcon,
  SaveIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"
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
        <StatementMovementRow
          key={movement.id}
          movement={fromStatementLine(movement)}
          display={display}
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Estado de cuenta"
          description={
            detail
              ? joinPlanningCaption(
                  `Corte ${formatCalendarDate(detail.statement.cycleEnd, display.locale)}`,
                  detail.statement.dueDate
                    ? `Vence ${formatCalendarDate(detail.statement.dueDate, display.locale)}`
                    : undefined,
                  FINANCE_CARD_STATEMENT_STATUS_LABEL[detail.statement.status]
                )
              : undefined
          }
          actions={
            <>
              {detail && !editing ? (
                <Button type="button" variant="outline" onClick={startEdit}>
                  <CalendarIcon className="size-4 shrink-0" />
                  Registrar corte
                </Button>
              ) : null}
              <SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.cardStatement} />
            </>
          }
        />
        <SheetBody>
          {detailQuery.isError ? (
            <ErrorState
              message={financeLoadErrorMessage(detailQuery.error)}
              onRetry={() => void detailQuery.refetch()}
              isRetrying={detailQuery.isFetching}
            />
          ) : null}

          <AsyncRegion
            pending={detailQuery.isPending}
            pendingFallback={<ListSkeleton rows={4} />}
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
                    <Field className="gap-0.5">
                      <FieldLabel
                        htmlFor="statement-minimum"
                        className="pl-2 text-sm text-muted-foreground"
                      >
                        Mínimo
                      </FieldLabel>
                      <InputGroup className="h-10 overflow-hidden px-1">
                        <InputGroupAddon align="inline-start">
                          <CoinsIcon className="text-muted-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="statement-minimum"
                          value={minimumPayment}
                          onChange={(event) =>
                            setMinimumPayment(event.target.value)
                          }
                        />
                      </InputGroup>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel
                        htmlFor="statement-closing-balance"
                        className="pl-2 text-sm text-muted-foreground"
                      >
                        Balance al corte
                      </FieldLabel>
                      <InputGroup className="h-10 overflow-hidden px-1">
                        <InputGroupAddon align="inline-start">
                          <WalletIcon className="text-muted-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="statement-closing-balance"
                          value={closingBalance}
                          onChange={(event) =>
                            setClosingBalance(event.target.value)
                          }
                        />
                      </InputGroup>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel
                        htmlFor="statement-due-date"
                        className="pl-2 text-sm text-muted-foreground"
                      >
                        Vence (AAAA-MM-DD)
                      </FieldLabel>
                      <InputGroup className="h-10 overflow-hidden px-1">
                        <InputGroupAddon align="inline-start">
                          <CalendarIcon className="text-muted-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="statement-due-date"
                          value={dueDate}
                          onChange={(event) => setDueDate(event.target.value)}
                        />
                      </InputGroup>
                    </Field>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="flex-1"
                        disabled={updateMutation.isPending}
                        onClick={saveEdit}
                      >
                        <SaveIcon className="size-4 shrink-0" />
                        Guardar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setEditing(false)}
                      >
                        <XIcon className="size-4 shrink-0" />
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
                      Saldo del corte
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatFinanceMoney(
                        detail.statement.remaining,
                        moneyDisplay
                      )}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  El saldo del corte es acumulativo: incluye los cortes
                  anteriores y no se suma como una deuda aparte.
                </p>

                <SettingsSection title="Movimientos del ciclo" bare>
                  <MovementList
                    movements={detail.movements}
                    display={moneyDisplay}
                    emptyLabel="Sin movimientos en este ciclo."
                  />
                </SettingsSection>

                <SettingsSection title="Pagos aplicados" bare>
                  <MovementList
                    movements={detail.payments}
                    display={moneyDisplay}
                    emptyLabel="Sin pagos aplicados."
                  />
                </SettingsSection>
              </div>
            ) : null}
          </AsyncRegion>
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
