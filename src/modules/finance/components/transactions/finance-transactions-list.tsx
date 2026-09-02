"use client"

import { TransactionDetailSheet } from "@/src/modules/finance/components/transactions/transaction-detail-sheet"
import { TransactionSheet } from "@/src/modules/finance/components/transactions/transaction-sheet"
import { TransferSheet } from "@/src/modules/finance/components/transactions/transfer-sheet"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import { useTransactions } from "@/src/modules/finance/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/lib/money"
import {
  FINANCE_TX_FILTER_ALL,
  FINANCE_TX_PAGE_SIZE,
  formatTransactionDate,
  transactionsFromPayload,
  type FinanceTransactionsQuery,
} from "@/src/modules/finance/lib/transactions-query"
import {
  FINANCE_TRANSACTION_STATUS_LABEL,
  FINANCE_TRANSACTION_STATUSES,
  FINANCE_TRANSACTION_TYPE_LABEL,
  FINANCE_TRANSACTION_TYPES,
  type FinanceTransaction,
  type FinanceTransactionStatus,
  type FinanceTransactionType,
} from "@/src/modules/finance/types/entities"
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks"
import { SettingsRow } from "@/src/shared/components/layout/settings-section"
import { SummarySection } from "@/src/shared/components/layout/summary"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  ArrowLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

type FinanceTransactionsListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
}

type FilterState = {
  dateFrom: string
  dateTo: string
  accountId: string
  cardId: string
  type: string
  status: string
}

const INITIAL_FILTERS: FilterState = {
  dateFrom: "",
  dateTo: "",
  accountId: FINANCE_TX_FILTER_ALL,
  cardId: FINANCE_TX_FILTER_ALL,
  type: FINANCE_TX_FILTER_ALL,
  status: FINANCE_TX_FILTER_ALL,
}

export function FinanceTransactionsList({
  enabled,
  display,
}: FinanceTransactionsListProps) {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceTransaction | null>(null)

  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const hasTargets = accounts.length > 0 || cards.length > 0
  const canTransfer = accounts.length + cards.length >= 2

  const query = useMemo<FinanceTransactionsQuery>(
    () => ({
      page,
      limit: FINANCE_TX_PAGE_SIZE,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      accountId:
        filters.accountId === FINANCE_TX_FILTER_ALL
          ? undefined
          : filters.accountId,
      cardId:
        filters.cardId === FINANCE_TX_FILTER_ALL ? undefined : filters.cardId,
      type:
        filters.type === FINANCE_TX_FILTER_ALL
          ? undefined
          : (filters.type as FinanceTransactionType),
      status:
        filters.status === FINANCE_TX_FILTER_ALL
          ? undefined
          : (filters.status as FinanceTransactionStatus),
    }),
    [page, filters],
  )

  const listQuery = useTransactions(enabled, query)
  const listed = transactionsFromPayload(listQuery.data)
  const { items, pagination } = listed

  const accountOptions = [
    { value: FINANCE_TX_FILTER_ALL, label: "Todas las cuentas" },
    ...accounts.map((account) => ({
      value: account.id,
      label: account.name,
    })),
  ]
  const cardOptions = [
    { value: FINANCE_TX_FILTER_ALL, label: "Todas las tarjetas" },
    ...cards.map((card) => ({
      value: card.id,
      label: card.name,
    })),
  ]
  const typeOptions = [
    { value: FINANCE_TX_FILTER_ALL, label: "Todos los tipos" },
    ...FINANCE_TRANSACTION_TYPES.map((value) => ({
      value,
      label: FINANCE_TRANSACTION_TYPE_LABEL[value],
    })),
  ]
  const statusOptions = [
    { value: FINANCE_TX_FILTER_ALL, label: "Todos los estados" },
    ...FINANCE_TRANSACTION_STATUSES.map((value) => ({
      value,
      label: FINANCE_TRANSACTION_STATUS_LABEL[value],
    })),
  ]

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setPage(1)
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!enabled || !hasTargets}
          onClick={() => setCreateOpen(true)}
        >
          <PlusIcon />
          Crear movimiento
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!enabled || !canTransfer}
          onClick={() => setTransferOpen(true)}
        >
          <ArrowLeftRightIcon />
          Transferir
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FormTextField
          label="Desde"
          type="date"
          value={filters.dateFrom}
          onChange={(value) => updateFilter("dateFrom", value)}
        />
        <FormTextField
          label="Hasta"
          type="date"
          value={filters.dateTo}
          onChange={(value) => updateFilter("dateTo", value)}
        />
        <SelectField
          label="Cuenta"
          value={filters.accountId}
          onChange={(value) => updateFilter("accountId", value)}
          options={accountOptions}
        />
        <SelectField
          label="Tarjeta"
          value={filters.cardId}
          onChange={(value) => updateFilter("cardId", value)}
          options={cardOptions}
        />
        <SelectField
          label="Tipo"
          value={filters.type}
          onChange={(value) => updateFilter("type", value)}
          options={typeOptions}
        />
        <SelectField
          label="Estado"
          value={filters.status}
          onChange={(value) => updateFilter("status", value)}
          options={statusOptions}
        />
      </div>

      {listQuery.isError ? (
        <p className="text-sm text-destructive">
          {financeErrorMessage(listQuery.error)}
        </p>
      ) : null}

      <SummarySection title="Movimientos" icon={ArrowLeftRightIcon}>
        {listQuery.isPending && !listQuery.data ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ArrowLeftRightIcon />
              </EmptyMedia>
              <EmptyTitle>No hay movimientos</EmptyTitle>
              <EmptyDescription>
                Crea un movimiento o una transferencia para empezar. Prueba
                otro periodo si ya tienes filtros activos.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          items.map((tx, index) => {
            const party = tx.merchant ?? tx.description ?? tx.accountName ?? "Movimiento"
            const meta = [
              formatTransactionDate(tx.transactionDate),
              FINANCE_TRANSACTION_TYPE_LABEL[tx.type] ?? tx.type,
              FINANCE_TRANSACTION_STATUS_LABEL[tx.status] ?? tx.status,
            ].join(" · ")
            return (
              <SettingsRow
                key={tx.id}
                label={party}
                value={`${meta} · ${formatFinanceMoney(tx.amount, {
                  ...display,
                  currency: tx.currency,
                })}`}
                onPress={() => setSelectedId(tx.id)}
                isLast={index === items.length - 1}
              />
            )
          })
        )}
      </SummarySection>

      {listQuery.isSuccess ? (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || listQuery.isPending}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeftIcon />
            Anterior
          </Button>
          <p className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages || listQuery.isPending}
            onClick={() => setPage((current) => current + 1)}
          >
            Siguiente
            <ChevronRightIcon />
          </Button>
        </div>
      ) : null}

      <TransactionDetailSheet
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
        transactionId={selectedId}
        enabled={enabled}
        display={display}
        onEdit={(transaction) => {
          setSelectedId(null)
          setEditing(transaction)
        }}
      />
      <TransactionSheet
        open={createOpen || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false)
            setEditing(null)
          }
        }}
        transaction={editing}
        accounts={accounts}
        cards={cards}
        defaultCurrency={display.currency}
        enabled={enabled}
      />
      <TransferSheet
        open={transferOpen}
        onOpenChange={setTransferOpen}
        accounts={accounts}
        cards={cards}
        defaultCurrency={display.currency}
      />
    </div>
  )
}
