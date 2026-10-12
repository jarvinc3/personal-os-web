"use client"

import {
  BrandLogo,
  CardNetworkMark,
} from "@/src/modules/finance/shared/components/brand-logo"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import {
  useConfirmTransaction,
  useDeleteTransaction,
  useRestoreTransaction,
  useReverseTransaction,
  useTransaction,
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
  transferDirectionLabel,
} from "@/src/modules/finance/shared/lib/transactions-query"
import {
  FINANCE_TRANSACTION_STATUS_LABEL,
  FINANCE_TRANSACTION_TYPE_LABEL,
  type FinanceTransaction,
  type FinanceTransactionType,
} from "@/src/modules/finance/shared/types/entities"
import { DeleteRecordDialog } from "@/src/modules/finance/shared/components/delete-record-dialog"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { SettingsSection } from "@/src/shared/components/layout/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummaryItem } from "@/src/shared/components/ui/summary"
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

import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"

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

function typeLabel(type: string): string {
  if (type in FINANCE_TRANSACTION_TYPE_LABEL) {
    return FINANCE_TRANSACTION_TYPE_LABEL[type as FinanceTransactionType]
  }
  return type
}

function canEdit(transaction: FinanceTransaction): boolean {
  if (isTransferTransaction(transaction)) {
    return false
  }
  return transaction.type === "DEBIT" || transaction.type === "CREDIT"
}

function canConfirm(transaction: FinanceTransaction): boolean {
  return transaction.status === "PENDING"
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
  const reverseMutation = useReverseTransaction()
  const deleteMutation = useDeleteTransaction()
  const restoreMutation = useRestoreTransaction()
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.transactionOptions)

  const tx = detailQuery.data
  const isMutating =
    confirmMutation.isPending ||
    reverseMutation.isPending ||
    deleteMutation.isPending

  async function onConfirm() {
    if (!tx) {
      return
    }
    try {
      await confirmMutation.mutateAsync(tx.id)
      appToast.success({ text1: "Movimiento confirmado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onReverse() {
    if (!tx) {
      return
    }
    try {
      await reverseMutation.mutateAsync(tx.id)
      appToast.success({ text1: "Movimiento reversado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  const [confirmOpen, setConfirmOpen] = useState(false)

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
      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        aria-label="Opciones del movimiento"
        onClick={() => setOpenOptionsSheet(true)}
      >
        <MoreVerticalIcon className="size-4.5" />
      </Button>
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
                leading={
                  <span className="inline-flex items-center gap-1">
                    <BrandLogo
                      name={tx.accountName ?? tx.cardName ?? "Origen"}
                      logoUrl={tx.institutionLogoUrl}
                      size={28}
                    />
                    {tx.cardId ? (
                      <CardNetworkMark
                        network={tx.network}
                        logoUrl={tx.networkLogoUrl}
                        size={28}
                      />
                    ) : null}
                  </span>
                }
                isLast={false}
                className="px-3"
              />
              <SummaryItem
                title="Destino"
                value={tx.transferToAccountName ?? tx.transferToCardName ?? "—"}
                leading={
                  <span className="inline-flex items-center gap-1">
                    <BrandLogo
                      name={
                        tx.transferToAccountName ??
                        tx.transferToCardName ??
                        "Destino"
                      }
                      logoUrl={tx.transferToInstitutionLogoUrl}
                      size={28}
                    />
                    {tx.transferToCardId ? (
                      <CardNetworkMark
                        network={tx.transferToNetwork}
                        logoUrl={tx.transferToNetworkLogoUrl}
                        size={28}
                      />
                    ) : null}
                  </span>
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
      </div>

      <RecordOptionsSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        description={formatTransactionDate(tx.transactionDate)}
        options={[
          ...(canEdit(tx)
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
          ...(isTransferTransaction(tx)
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
    </>
  )
}
