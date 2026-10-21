"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { DeleteRecordDialog } from "@/src/modules/finance/shared/components/delete-record-dialog"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useUnlinkTransaction } from "@/src/modules/finance/shared/hooks/use-transaction-link"
import {
  useConfirmTransaction,
  useConfirmTransfer,
  useDeleteTransaction,
  useMarkNotDuplicate,
  useMergeTransaction,
  useRestoreTransaction,
  useReverseTransaction,
  useReverseTransfer,
  useTransaction,
  useUnconfirmTransaction,
  useUnconfirmTransfer,
} from "@/src/modules/finance/shared/hooks/use-transactions"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  formatTransactionDate,
  isTransferTransaction,
} from "@/src/modules/finance/shared/lib/transactions-query"
import { LinkTransactionSheet } from "@/src/modules/finance/transactions/components/link-transaction-sheet"
import { TransactionConfirmAlert } from "@/src/modules/finance/transactions/components/transaction-confirm-alert"
import { TransactionDetailActions } from "@/src/modules/finance/transactions/components/transaction-detail-actions"
import { TransactionDetailFacts } from "@/src/modules/finance/transactions/components/transaction-detail-facts"
import { TransactionDetailLinks } from "@/src/modules/finance/transactions/components/transaction-detail-links"
import { TransactionReversalNotice } from "@/src/modules/finance/transactions/components/transaction-reversal-notice"
import { canEditTransaction } from "@/src/modules/finance/transactions/lib/transaction-edit"
import { ChatLauncherButton, useRegisterChatContext } from "@/src/modules/ai"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { ACCENT_FALLBACK_COLOR } from "@/src/shared/lib/accent-gradient"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ArrowLeftRightIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

type FinanceTransactionDetailProps = {
  transactionId: string
}

export function TransactionDetailScreen({
  transactionId,
}: FinanceTransactionDetailProps) {
  return (
    <FinanceGate>
      <TransactionDetailScreenBody transactionId={transactionId} />
    </FinanceGate>
  )
}

function TransactionDetailScreenBody({
  transactionId,
}: FinanceTransactionDetailProps) {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const display: FinanceMoneyDisplay = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const detailQuery = useTransaction(isEnabled, transactionId)
  const confirmMutation = useConfirmTransaction()
  const confirmTransferMutation = useConfirmTransfer()
  const unconfirmMutation = useUnconfirmTransaction()
  const unconfirmTransferMutation = useUnconfirmTransfer()
  const reverseMutation = useReverseTransaction()
  const reverseTransferMutation = useReverseTransfer()
  const unlinkMutation = useUnlinkTransaction()
  const deleteMutation = useDeleteTransaction()
  const mergeMutation = useMergeTransaction()
  const notDuplicateMutation = useMarkNotDuplicate()
  const restoreMutation = useRestoreTransaction()
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.transactionOptions)

  const tx = detailQuery.data

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [mergeOpen, setMergeOpen] = useState(false)
  const [unlinkOpen, setUnlinkOpen] = useState(false)

  useRegisterChatContext(
    tx
      ? {
          moduleSlug: "finance",
          screen: "transaction-detail",
          entityRef: {
            type: isTransferTransaction(tx) ? "transfer" : "transaction",
            id: tx.id,
          },
          entityLabel: tx.description ?? tx.merchant ?? "Movimiento",
        }
      : null
  )

  const isMutating =
    confirmMutation.isPending ||
    confirmTransferMutation.isPending ||
    unconfirmMutation.isPending ||
    unconfirmTransferMutation.isPending ||
    reverseMutation.isPending ||
    reverseTransferMutation.isPending ||
    deleteMutation.isPending

  async function onMerge() {
    if (!tx?.possibleDuplicateOfId) {
      return
    }
    try {
      await mergeMutation.mutateAsync({
        id: tx.id,
        intoId: tx.possibleDuplicateOfId,
      })
      appToast.success({ text1: "Movimientos unidos" })
      router.back()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onNotDuplicate() {
    if (!tx) {
      return
    }
    try {
      await notDuplicateMutation.mutateAsync(tx.id)
      appToast.success({ text1: "Marcado como no duplicado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onConfirm() {
    if (!tx) {
      return
    }
    const isTransfer = isTransferTransaction(tx)
    try {
      await (isTransfer
        ? confirmTransferMutation.mutateAsync(tx.id)
        : confirmMutation.mutateAsync(tx.id))
      appToast.success({
        text1: isTransfer
          ? "Transferencia confirmada"
          : "Movimiento confirmado",
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onUnconfirm() {
    if (!tx) {
      return
    }
    const isTransfer = isTransferTransaction(tx)
    try {
      await (isTransfer
        ? unconfirmTransferMutation.mutateAsync(tx.id)
        : unconfirmMutation.mutateAsync(tx.id))
      appToast.success({
        text1: isTransfer
          ? "Transferencia desbloqueada para editar"
          : "Movimiento desbloqueado para editar",
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onReverse() {
    if (!tx) {
      return
    }
    const isTransfer = isTransferTransaction(tx)
    try {
      await (isTransfer
        ? reverseTransferMutation.mutateAsync(tx.id)
        : reverseMutation.mutateAsync(tx.id))
      appToast.success({
        text1: isTransfer ? "Transferencia reversada" : "Movimiento reversado",
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onUnlink() {
    if (!tx) {
      return
    }
    try {
      await unlinkMutation.mutateAsync(tx.id)
      appToast.success({ text1: "Vínculo quitado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDelete() {
    if (!tx) {
      return
    }
    setOpenOptionsSheet(false)
    try {
      const transactionId = tx.id
      await deleteMutation.mutateAsync(transactionId)
      setConfirmOpen(false)
      router.back()
      showUndoToast("Movimiento eliminado", () =>
        restoreMutation.mutate(transactionId, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  const headerActions = useMemo(
    () => (
      <>
        <ChatLauncherButton />
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full"
          aria-label="Opciones del movimiento"
          onClick={() => setOpenOptionsSheet(true)}
        >
          <MoreVerticalIcon className="size-4.5" />
        </Button>
      </>
    ),
    [setOpenOptionsSheet]
  )

  usePageHeader(
    {
      variant: "secondary",
      title: tx && isTransferTransaction(tx) ? "Transferencia" : "Movimiento",
      onBack: () => router.back(),
      actions: headerActions,
      accentColor: ACCENT_FALLBACK_COLOR,
    },
    [router, tx, headerActions]
  )

  if (detailQuery.isPending) {
    return <LoadingView />
  }

  if (!tx) {
    return (
      <MissingRecord
        icon={ArrowLeftRightIcon}
        title="No encontramos este movimiento"
        description="Puede que se haya eliminado o que el enlace esté roto."
        backHref={APP_ROUTES.app.financeTransactions}
        backLabel="Volver a Movimientos"
      />
    )
  }

  const options = [
    ...(canEditTransaction(tx) && !isTransferTransaction(tx)
      ? [
          {
            id: "edit",
            title: "Editar movimiento",
            icon: PencilIcon,
            onPress: () =>
              router.push(APP_ROUTES.app.financeTransactionEdit(tx.id)),
          },
        ]
      : []),
    ...(isTransferTransaction(tx) && tx.status === "PENDING"
      ? [
          {
            id: "edit-transfer",
            title: "Editar transferencia",
            icon: PencilIcon,
            onPress: () =>
              router.push(APP_ROUTES.app.financeTransferEdit(tx.id)),
          },
        ]
      : []),
    {
      id: "delete",
      title: "Eliminar",
      icon: Trash2Icon,
      destructive: true,
      onPress: () => setConfirmOpen(true),
    },
  ]

  return (
    <>
      {detailQuery.error ? (
        <div className="mx-4 mb-3">
          <FinanceErrorState
            message={financeLoadErrorMessage(detailQuery.error)}
            onRetry={() => void detailQuery.refetch()}
            isRetrying={detailQuery.isFetching}
          />
        </div>
      ) : null}

      <TransactionDetailLinks
        transaction={tx}
        merging={mergeMutation.isPending}
        markingNotDuplicate={notDuplicateMutation.isPending}
        unlinking={unlinkMutation.isPending}
        onOpenMerge={() => setMergeOpen(true)}
        onMarkNotDuplicate={() => void onNotDuplicate()}
        onOpenLink={() => setLinkOpen(true)}
        onOpenUnlink={() => setUnlinkOpen(true)}
      />

      <TransactionReversalNotice
        transaction={tx}
        onOpenOriginal={(id) =>
          router.push(APP_ROUTES.app.financeTransaction(id))
        }
      />

      <div className="mx-4 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {formatTransactionDate(tx.transactionDate)}
        </p>

        <TransactionDetailFacts transaction={tx} display={display} />

        <TransactionDetailActions
          transaction={tx}
          busy={isMutating}
          confirming={
            confirmMutation.isPending || confirmTransferMutation.isPending
          }
          unconfirming={
            unconfirmMutation.isPending || unconfirmTransferMutation.isPending
          }
          reversing={
            reverseMutation.isPending || reverseTransferMutation.isPending
          }
          onConfirm={() => void onConfirm()}
          onUnconfirm={() => void onUnconfirm()}
          onReverse={() => void onReverse()}
        />
      </div>

      <RecordOptionsSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        description={formatTransactionDate(tx.transactionDate)}
        options={options}
      />

      <DeleteRecordDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        recordName={tx.description ?? tx.merchant ?? "Movimiento"}
        pending={deleteMutation.isPending}
        consequences={`Se elimina ${formatFinanceMoney(tx.amount, {
          ...display,
          currency: tx.currency,
        })}. El saldo de la cuenta se corrige y no se puede deshacer.`}
        onConfirm={() => void onDelete()}
      />

      <TransactionConfirmAlert
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        title="¿Unir los movimientos?"
        description="Los dos movimientos se unen en uno. No se puede deshacer."
        confirmLabel="Unir"
        pending={mergeMutation.isPending}
        onConfirm={() => void onMerge()}
      />

      <TransactionConfirmAlert
        open={unlinkOpen}
        onOpenChange={setUnlinkOpen}
        title="¿Quitar el vínculo?"
        description="El movimiento deja de estar ligado a la planificación."
        confirmLabel="Quitar"
        pending={unlinkMutation.isPending}
        onConfirm={() => void onUnlink()}
      />

      <LinkTransactionSheet
        open={linkOpen}
        onOpenChange={setLinkOpen}
        transactionId={tx.id}
        display={display}
        onLinked={() => void detailQuery.refetch()}
      />
    </>
  )
}
