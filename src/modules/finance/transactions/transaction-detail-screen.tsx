"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { DeleteRecordDialog } from "@/src/modules/finance/shared/components/delete-record-dialog"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useMerchant } from "@/src/modules/finance/shared/hooks/use-merchants"
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
import { TransactionDetailActions } from "@/src/modules/finance/transactions/components/transaction-detail-actions"
import { TransactionDetailFacts } from "@/src/modules/finance/transactions/components/transaction-detail-facts"
import { TransactionSignalTrace } from "@/src/modules/finance/transactions/components/transaction-signal-trace"
import { TransactionDetailLinks } from "@/src/modules/finance/transactions/components/transaction-detail-links"
import { TransactionReversalNotice } from "@/src/modules/finance/transactions/components/transaction-reversal-notice"
import { canEditTransaction } from "@/src/modules/finance/transactions/lib/transaction-edit"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { Button } from "@/src/shared/components/ui/button"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { TAB_QUERY_KEY } from "@/src/shared/hooks/use-tabs-behavior"
import { ACCENT_FALLBACK_COLOR } from "@/src/shared/lib/accent-gradient"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ArrowLeftRightIcon,
  ClockIcon,
  GitMergeIcon,
  MoreVerticalIcon,
  PencilIcon,
  RotateCcwIcon,
  Trash2Icon,
  UnlinkIcon,
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
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const display: FinanceMoneyDisplay = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
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
    useSheetParam(FINANCE_SHEET_KEYS.transactionOptions, {
      clearOnOpen: [TAB_QUERY_KEY],
    })

  const tx = detailQuery.data
  const accountsQuery = useAccounts(isEnabled)
  const cardsQuery = useCards(isEnabled)
  const categoriesQuery = useCategories(isEnabled)
  const merchantQuery = useMerchant(isEnabled, tx?.merchantId ?? null)
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const account = tx?.accountId
    ? (accounts.find((item) => item.id === tx.accountId) ?? null)
    : null
  const card = tx?.cardId
    ? (cards.find((item) => item.id === tx.cardId) ?? null)
    : null
  const merchant = merchantQuery.data ?? null

  const [confirmOpen, setConfirmOpen] = useState(false)
  const { open: linkOpen, setOpen: setLinkOpen } = useSheetParam(
    FINANCE_SHEET_KEYS.linkTransaction
  )
  const [mergeOpen, setMergeOpen] = useState(false)
  const [unlinkOpen, setUnlinkOpen] = useState(false)
  const [unconfirmOpen, setUnconfirmOpen] = useState(false)
  const [reverseOpen, setReverseOpen] = useState(false)

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

  const affectedAccountLabel = tx.cardName
    ? `la tarjeta ${tx.cardName}`
    : tx.accountName
      ? `la cuenta ${tx.accountName}`
      : "la cuenta del movimiento"
  const formattedAmount = formatFinanceMoney(tx.amount, {
    ...display,
    currency: tx.currency,
  })

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
          <ErrorState
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
          {formatTransactionDate(tx.transactionDate, display.locale)}
        </p>

        <TransactionDetailFacts
          transaction={tx}
          display={display}
          categories={categories}
          accounts={accounts}
          cards={cards}
          account={account}
          card={card}
          merchant={merchant}
        />

        <TransactionSignalTrace transaction={tx} />

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
          onUnconfirm={() => setUnconfirmOpen(true)}
          onReverse={() => setReverseOpen(true)}
        />
      </div>

      <RecordOptionsSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        description={formatTransactionDate(tx.transactionDate, display.locale)}
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

      <ConfirmDialog
        open={unconfirmOpen}
        onOpenChange={setUnconfirmOpen}
        icon={ClockIcon}
        title="¿Marcar como pendiente?"
        description={`${formattedAmount} deja de contar en el saldo de ${affectedAccountLabel} hasta que se confirme otra vez.`}
        confirmLabel="Marcar pendiente"
        confirmIcon={ClockIcon}
        pending={
          unconfirmMutation.isPending || unconfirmTransferMutation.isPending
        }
        pendingLabel="Marcando..."
        onConfirm={() => {
          setUnconfirmOpen(false)
          void onUnconfirm()
        }}
      />

      <ConfirmDialog
        open={reverseOpen}
        onOpenChange={setReverseOpen}
        icon={RotateCcwIcon}
        title="¿Reversar el movimiento?"
        description={`Se crea el asiento contrario de ${formattedAmount}. El saldo de ${affectedAccountLabel} se corrige y no se puede deshacer.`}
        confirmLabel="Reversar"
        confirmIcon={RotateCcwIcon}
        pending={reverseMutation.isPending || reverseTransferMutation.isPending}
        pendingLabel="Reversando..."
        onConfirm={() => {
          setReverseOpen(false)
          void onReverse()
        }}
      />

      <ConfirmDialog
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        icon={GitMergeIcon}
        title="¿Unir los movimientos?"
        description="Los dos movimientos se unen en uno. No se puede deshacer."
        confirmLabel="Unir"
        confirmIcon={GitMergeIcon}
        pending={mergeMutation.isPending}
        pendingLabel="Uniendo..."
        onConfirm={() => void onMerge()}
      />

      <ConfirmDialog
        open={unlinkOpen}
        onOpenChange={setUnlinkOpen}
        icon={UnlinkIcon}
        title="¿Quitar el vínculo?"
        description="El movimiento deja de estar ligado a la planificación."
        confirmLabel="Quitar"
        confirmIcon={UnlinkIcon}
        pending={unlinkMutation.isPending}
        pendingLabel="Quitando..."
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
