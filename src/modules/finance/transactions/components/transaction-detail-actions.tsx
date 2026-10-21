"use client"

import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import { canReverseTransaction } from "@/src/modules/finance/shared/lib/transactions-query"
import {
  canConfirmTransaction,
  canUnlockConfirmedTransaction,
} from "@/src/modules/finance/transactions/lib/transaction-detail"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"

type TransactionDetailActionsProps = {
  transaction: FinanceTransaction
  busy: boolean
  confirming: boolean
  unconfirming: boolean
  reversing: boolean
  onConfirm: () => void
  onUnconfirm: () => void
  onReverse: () => void
}

export function TransactionDetailActions({
  transaction,
  busy,
  confirming,
  unconfirming,
  reversing,
  onConfirm,
  onUnconfirm,
  onReverse,
}: TransactionDetailActionsProps) {
  const canConfirm = canConfirmTransaction(transaction)
  const canUnlock = canUnlockConfirmedTransaction(transaction)
  const canReverse = canReverseTransaction(transaction)

  if (!canConfirm && !canReverse && !canUnlock) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {canConfirm ? (
        <Button type="button" disabled={busy} onClick={onConfirm}>
          {confirming ? <Spinner data-icon="inline-start" /> : null}
          Confirmar
        </Button>
      ) : null}
      {canUnlock ? (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onUnconfirm}
        >
          {unconfirming ? <Spinner data-icon="inline-start" /> : null}
          Marcar como pendiente
        </Button>
      ) : null}
      {canReverse ? (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onReverse}
        >
          {reversing ? <Spinner data-icon="inline-start" /> : null}
          Reversar
        </Button>
      ) : null}
    </div>
  )
}
