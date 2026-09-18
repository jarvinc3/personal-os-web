"use client"

import {
  useConfirmTransaction,
  useDeleteTransaction,
  useReverseTransaction,
  useTransaction,
} from "@/src/modules/finance/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/lib/money"
import {
  canReverseTransaction,
  formatTransactionDate,
  isTransferTransaction,
  transferDirectionLabel,
} from "@/src/modules/finance/lib/transactions-query"
import {
  FINANCE_TRANSACTION_STATUS_LABEL,
  FINANCE_TRANSACTION_TYPE_LABEL,
  type FinanceTransaction,
  type FinanceTransactionType,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { SettingsSection } from "@/src/shared/components/layout/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"

type TransactionDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string | null
  enabled: boolean
  display: FinanceMoneyDisplay
  onEdit: (transaction: FinanceTransaction) => void
}

function typeLabel(type: string): string {
  if (type in FINANCE_TRANSACTION_TYPE_LABEL) {
    return FINANCE_TRANSACTION_TYPE_LABEL[type as FinanceTransactionType]
  }
  return type
}

function canEdit(tx: FinanceTransaction): boolean {
  if (isTransferTransaction(tx)) return false
  return tx.type === "DEBIT" || tx.type === "CREDIT"
}

function canConfirm(tx: FinanceTransaction): boolean {
  return tx.status === "PENDING"
}

export function TransactionDetailSheet({
  open,
  onOpenChange,
  transactionId,
  enabled,
  display,
  onEdit,
}: TransactionDetailSheetProps) {
  const detailQuery = useTransaction(enabled && open, transactionId)
  const confirmMutation = useConfirmTransaction()
  const reverseMutation = useReverseTransaction()
  const deleteMutation = useDeleteTransaction()
  const tx = detailQuery.data
  const isMutating =
    confirmMutation.isPending ||
    reverseMutation.isPending ||
    deleteMutation.isPending

  async function onConfirm() {
    if (!tx) return
    try {
      await confirmMutation.mutateAsync(tx.id)
      appToast.success({ text1: "Movimiento confirmado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onReverse() {
    if (!tx) return
    try {
      await reverseMutation.mutateAsync(tx.id)
      appToast.success({ text1: "Movimiento reversado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDelete() {
    if (!tx) return
    const confirmed = window.confirm(
      "¿Eliminar este movimiento? No se puede deshacer."
    )
    if (!confirmed) return
    try {
      await deleteMutation.mutateAsync(tx.id)
      appToast.success({ text1: "Movimiento eliminado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={tx && isTransferTransaction(tx) ? "Transferencia" : "Movimiento"}
      description={tx ? formatTransactionDate(tx.transactionDate) : undefined}
      actions={{
        delete: tx ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isMutating}
            onClick={() => void onDelete()}
          >
            Eliminar
          </Button>
        ) : undefined,
        close: (
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        ),
        submit:
          tx && canEdit(tx) ? (
            <Button
              type="button"
              disabled={isMutating}
              onClick={() => onEdit(tx)}
            >
              Editar
            </Button>
          ) : undefined,
      }}
    >
      {detailQuery.isPending ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : detailQuery.isError ? (
        <p className="text-sm text-destructive">
          {financeErrorMessage(detailQuery.error)}
        </p>
      ) : tx ? (
        <>
          <SettingsSection title="Detalle">
            <SummaryItem
              title="Monto"
              value={formatFinanceMoney(tx.amount, {
                ...display,
                currency: tx.currency,
              })}
              isLast={false}
              className="px-3"
            />
            <SummaryItem
              title="En moneda base"
              value={formatFinanceMoney(tx.amountBaseCurrency, display)}
              isLast={false}
              className="px-3"
            />
            <SummaryItem
              title="Tipo"
              value={typeLabel(tx.type)}
              isLast={false}
              className="px-3"
            />
            <SummaryItem
              title="Estado"
              value={FINANCE_TRANSACTION_STATUS_LABEL[tx.status] ?? tx.status}
              isLast={false}
              className="px-3"
            />
            {isTransferTransaction(tx) ? (
              <>
                <SummaryItem
                  title="Origen"
                  value={tx.accountName ?? tx.cardName ?? "—"}
                  isLast={false}
                  className="px-3"
                />
                <SummaryItem
                  title="Destino"
                  value={
                    tx.transferToAccountName ?? tx.transferToCardName ?? "—"
                  }
                  isLast={false}
                  className="px-3"
                />
                <SummaryItem
                  title="Ruta"
                  value={transferDirectionLabel(tx)}
                  isLast={false}
                  className="px-3"
                />
              </>
            ) : (
              <>
                <SummaryItem
                  title="Cuenta"
                  value={tx.accountName ?? "—"}
                  isLast={false}
                  className="px-3"
                />
                <SummaryItem
                  title="Tarjeta"
                  value={tx.cardName ?? "—"}
                  isLast={false}
                  className="px-3"
                />
              </>
            )}
            <SummaryItem
              title="Comercio"
              value={tx.merchant ?? "—"}
              isLast={false}
              className="px-3"
            />
            <SummaryItem
              title="Descripción"
              value={tx.description ?? "—"}
              isLast
              className="px-3"
            />
          </SettingsSection>
          {canConfirm(tx) || canReverseTransaction(tx) ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              {canConfirm(tx) ? (
                <Button
                  type="button"
                  disabled={isMutating}
                  onClick={() => void onConfirm()}
                >
                  {confirmMutation.isPending ? (
                    <Spinner data-icon="inline-start" />
                  ) : null}
                  Confirmar
                </Button>
              ) : null}
              {canReverseTransaction(tx) ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isMutating}
                  onClick={() => void onReverse()}
                >
                  {reverseMutation.isPending ? (
                    <Spinner data-icon="inline-start" />
                  ) : null}
                  Reversar
                </Button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </BottomSheet>
  )
}
