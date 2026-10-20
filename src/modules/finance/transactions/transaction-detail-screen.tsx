"use client"

import {
  BrandLogo,
  CardNetworkMark,
} from "@/src/modules/finance/shared/components/brand-logo"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { LinkTransactionSheet } from "@/src/modules/finance/transactions/components/link-transaction-sheet"
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
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import {
  canReverseTransaction,
  formatTransactionDate,
  isTransferTransaction,
  movementSign,
} from "@/src/modules/finance/shared/lib/transactions-query"
import { FINANCE_TRANSACTION_STATUS_LABEL } from "@/src/modules/finance/shared/types/entities"
import { TransactionReversalNotice } from "@/src/modules/finance/transactions/components/transaction-reversal-notice"
import { TransactionTransferDetails } from "@/src/modules/finance/transactions/components/transaction-transfer-details"
import {
  canConfirmTransaction as canConfirm,
  canUnlockConfirmedTransaction as canUnlock,
  transactionTypeLabel as typeLabel,
} from "@/src/modules/finance/transactions/lib/transaction-detail"
import { DeleteRecordDialog } from "@/src/modules/finance/shared/components/delete-record-dialog"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { SettingsSection } from "@/src/shared/components/layout/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { ChatLauncherButton, useRegisterChatContext } from "@/src/modules/ai"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { ACCENT_FALLBACK_COLOR } from "@/src/shared/lib/accent-gradient"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ArrowLeftRightIcon,
  CopyIcon,
  GitMergeIcon,
  LinkIcon,
  MoreVerticalIcon,
  PencilIcon,
  TargetIcon,
  Trash2Icon,
  UnlinkIcon,
  XIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { canEditTransaction } from "@/src/modules/finance/transactions/lib/transaction-edit"

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
  const restoreMutation = useRestoreTransaction()
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.transactionOptions)

  const tx = detailQuery.data

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

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [mergeOpen, setMergeOpen] = useState(false)
  const [unlinkOpen, setUnlinkOpen] = useState(false)

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

      {tx.possibleDuplicateOfId ? (
        <div className="mx-4 mb-3">
          <SummarySection title="¿Duplicado?" icon={CopyIcon}>
            <p className="px-1 text-sm text-muted-foreground">
              Puede ser el mismo hecho que otro movimiento.
            </p>
            <div className="flex gap-2 px-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={mergeMutation.isPending}
                onClick={() => setMergeOpen(true)}
              >
                <GitMergeIcon className="size-4 shrink-0" />
                Unir
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={notDuplicateMutation.isPending}
                onClick={() => void onNotDuplicate()}
              >
                <XIcon className="size-4 shrink-0" />
                No es duplicado
              </Button>
            </div>
          </SummarySection>
        </div>
      ) : null}

      {!isTransferTransaction(tx) ? (
        <div className="mx-4 mb-3">
          <SummarySection title="Planificación" icon={TargetIcon}>
            {tx.planningLink ? (
              <>
                <p className="px-1 text-sm font-medium">
                  {tx.planningLink.label}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  disabled={unlinkMutation.isPending}
                  onClick={() => setUnlinkOpen(true)}
                >
                  <UnlinkIcon className="size-4 shrink-0" />
                  Quitar vínculo
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setLinkOpen(true)}
              >
                <LinkIcon className="size-4 shrink-0" />
                Vincular a cuota, cobro o meta
              </Button>
            )}
          </SummarySection>
        </div>
      ) : null}

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

        <SettingsSection title="Detalle">
          <SummaryItem
            title="Monto"
            value={
              tx.type === "ADJUSTMENT"
                ? `${movementSign(tx) ?? ""} ${formatFinanceMoney(tx.amount, {
                    ...display,
                    currency: tx.currency,
                  })}`.trim()
                : formatFinanceMoney(tx.amount, {
                    ...display,
                    currency: tx.currency,
                  })
            }
            isLast={false}
            className="px-3"
          />
          {isTransferTransaction(tx) && tx.transferToAmount ? (
            <SummaryItem
              title="Monto recibido"
              value={formatFinanceMoney(tx.transferToAmount, {
                ...display,
                currency: tx.transferToCurrency ?? tx.currency,
              })}
              isLast={false}
              className="px-3"
            />
          ) : null}
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
            <TransactionTransferDetails transaction={tx} />
          ) : (
            <>
              <SummaryItem
                title="Cuenta"
                value={tx.accountName ?? "—"}
                leading={
                  tx.accountId ? (
                    <BrandLogo
                      name={tx.accountName ?? "Cuenta"}
                      logoUrl={tx.institutionLogoUrl}
                      size={28}
                    />
                  ) : undefined
                }
                isLast={false}
                className="px-3"
              />
              <SummaryItem
                title="Tarjeta"
                value={tx.cardName ?? "—"}
                leading={
                  tx.cardId ? (
                    <span className="inline-flex items-center gap-1">
                      <BrandLogo
                        name={tx.cardName ?? "Tarjeta"}
                        logoUrl={tx.institutionLogoUrl}
                        size={28}
                      />
                      <CardNetworkMark
                        network={tx.network}
                        logoUrl={tx.networkLogoUrl}
                        size={28}
                      />
                    </span>
                  ) : undefined
                }
                isLast={false}
                className="px-3"
              />
            </>
          )}
          <SummaryItem
            title="Comercio"
            value={tx.merchantName ?? tx.merchant ?? "—"}
            leading={
              tx.merchantLogoUrl ? (
                <BrandLogo
                  name={tx.merchantName ?? tx.merchant ?? "Comercio"}
                  logoUrl={tx.merchantLogoUrl}
                  size={28}
                />
              ) : undefined
            }
            description={
              tx.merchantName && tx.merchant ? tx.merchant : undefined
            }
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

        {canConfirm(tx) || canReverseTransaction(tx) || canUnlock(tx) ? (
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
            {canUnlock(tx) ? (
              <Button
                type="button"
                variant="outline"
                disabled={isMutating}
                onClick={() => void onUnconfirm()}
              >
                {unconfirmMutation.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : null}
                Marcar como pendiente
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
      </div>

      <RecordOptionsSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        description={formatTransactionDate(tx.transactionDate)}
        options={[
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
        ]}
      />

      <DeleteRecordDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        recordName={tx.merchant ?? tx.description ?? "Movimiento"}
        pending={deleteMutation.isPending}
        consequences="El saldo de la cuenta se corrige. No se puede deshacer."
        onConfirm={() => void onDelete()}
      />

      <AlertDialog open={mergeOpen} onOpenChange={setMergeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Unir los movimientos?</AlertDialogTitle>
            <AlertDialogDescription>
              Los dos movimientos se unen en uno. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mergeMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={mergeMutation.isPending}
              onClick={() => void onMerge()}
            >
              Unir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={unlinkOpen} onOpenChange={setUnlinkOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar el vínculo?</AlertDialogTitle>
            <AlertDialogDescription>
              El movimiento deja de estar ligado a la planificación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlinkMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={unlinkMutation.isPending}
              onClick={() => void onUnlink()}
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
