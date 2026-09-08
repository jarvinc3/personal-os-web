"use client"

import { TransactionDetailSheet } from "@/src/modules/finance/components/transactions/transaction-detail-sheet";
import {
  countActiveTransactionFilters,
  INITIAL_TRANSACTION_FILTERS,
  TransactionFiltersSheet,
  type TransactionFilterState,
} from "@/src/modules/finance/components/transactions/transaction-filters-sheet";
import { TransactionSheet } from "@/src/modules/finance/components/transactions/transaction-sheet";
import { TransferSheet } from "@/src/modules/finance/components/transactions/transfer-sheet";
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys";
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts";
import { useCards } from "@/src/modules/finance/hooks/use-cards";
import { useSheetQueryEntity } from "@/src/modules/finance/hooks/use-sheet-entity";
import {
  useTransaction,
  useTransactions,
} from "@/src/modules/finance/hooks/use-transactions";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import {
  FINANCE_TX_FILTER_ALL,
  FINANCE_TX_PAGE_SIZE,
  formatTransactionDate,
  transactionsFromPayload,
  visibleTransactionTotals,
  type FinanceTransactionsQuery,
} from "@/src/modules/finance/lib/transactions-query";
import {
  FINANCE_TRANSACTION_STATUS_LABEL,
  FINANCE_TRANSACTION_STATUSES,
  FINANCE_TRANSACTION_TYPE_LABEL,
  FINANCE_TRANSACTION_TYPES,
  type FinanceTransactionStatus,
  type FinanceTransactionType,
} from "@/src/modules/finance/types/entities";
import { ExpandableFab } from "@/src/shared/components/layout/expandable-fab";
import { FilterSearchToolbar } from "@/src/shared/components/layout/filters";
import { SettingsRow } from "@/src/shared/components/layout/settings-section";
import { Button } from "@/src/shared/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params";
import {
  ArrowLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type FinanceTransactionsListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
}

const SEARCH_DEBOUNCE_MS = 300

export function FinanceTransactionsList({
  enabled,
  display,
}: FinanceTransactionsListProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filters, setFilters] = useState<TransactionFilterState>(
    INITIAL_TRANSACTION_FILTERS,
  )
  const { open: openFilterSheet, setOpen: setOpenFilterSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.transactionFilters)
  const {
    open: openDetailSheet,
    sheetId: detailSheetId,
    setOpen: setOpenDetailSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.transactionDetail)
  const {
    open: openTransactionSheet,
    sheetId: transactionSheetId,
    setOpen: setOpenTransactionSheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.transaction)
  const { open: openTransferSheet, setOpen: setOpenTransferSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.transfer)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (openDetailSheet && !detailSheetId) {
      setOpenDetailSheet(false)
    }
  }, [openDetailSheet, detailSheetId, setOpenDetailSheet])

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
      search: debouncedSearch || undefined,
    }),
    [page, filters, debouncedSearch],
  )

  const listQuery = useTransactions(enabled, query)
  const listed = transactionsFromPayload(listQuery.data)
  const { items, pagination } = listed
  const totals = useMemo(() => visibleTransactionTotals(items), [items])
  const editingQuery = useTransaction(
    enabled && openTransactionSheet && Boolean(transactionSheetId),
    transactionSheetId,
  )
  const editing = useSheetQueryEntity(
    openTransactionSheet,
    transactionSheetId,
    editingQuery,
    setOpenTransactionSheet,
  )

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

  function applyFilters(next: TransactionFilterState) {
    setFilters(next)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <FilterSearchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar comercio o descripción..."
        activeFilterCount={countActiveTransactionFilters(filters)}
        onFilterPress={() => setOpenFilterSheet(true)}
      />

      <div className="flex flex-col gap-1 p-3 rounded-xl border border-border bg-card">
        <div className="flex flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">Total movimientos visibles</p>
          <p className="text-xs text-muted-foreground">{items.length} registros</p>
        </div>
        <div className="flex flex-row justify-between items-center">
          <p className="text-sm tabular-nums text-success">
            ↑ {formatFinanceMoney(totals.income, display)}
          </p>
          <p className="text-sm tabular-nums text-destructive">
            ↓ {formatFinanceMoney(totals.expenses, display)}
          </p>
        </div>
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
                onPress={() => setOpenDetailSheet(true, tx.id)}
                isLast={index === items.length - 1}
              />
            )
          })
        )}
      </SummarySection>

      {listQuery.isSuccess ? (
        <div className="flex gap-3 justify-between items-center">
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

      <ExpandableFab actions={[
        {
          icon: <MinusIcon />,
          label: "Gasto",
          onClick: () => setOpenTransactionSheet(true, null),
          disabled: !enabled || !hasTargets,
          color: "bg-destructive",
        },
        {
          icon: <PlusIcon />,
          label: "Ingreso",
          onClick: () => setOpenTransactionSheet(true, null),
          disabled: !enabled || !hasTargets,
          color: "bg-success",
        },
        {
          icon: <ArrowLeftRightIcon />,
          label: "Transferir",
          onClick: () => setOpenTransferSheet(true),
          disabled: !enabled || !canTransfer,
          color: "bg-blue-500",
        },
      ]} />

      <TransactionFiltersSheet
        open={openFilterSheet}
        onOpenChange={setOpenFilterSheet}
        filters={filters}
        onApply={applyFilters}
        accountOptions={accountOptions}
        cardOptions={cardOptions}
        typeOptions={typeOptions}
        statusOptions={statusOptions}
      />

      <TransactionDetailSheet
        open={openDetailSheet && Boolean(detailSheetId)}
        onOpenChange={setOpenDetailSheet}
        transactionId={detailSheetId}
        enabled={enabled}
        display={display}
        onEdit={(transaction) => {
          setOpenTransactionSheet(true, transaction.id)
        }}
      />

      <TransactionSheet
        open={
          openTransactionSheet &&
          (!transactionSheetId || Boolean(editing))
        }
        onOpenChange={setOpenTransactionSheet}
        transaction={editing}
        accounts={accounts}
        cards={cards}
        defaultCurrency={display.currency}
        enabled={enabled}
      />

      <TransferSheet
        open={openTransferSheet}
        onOpenChange={setOpenTransferSheet}
        accounts={accounts}
        cards={cards}
        defaultCurrency={display.currency}
      />
    </div>
  )
}
