"use client"

import { TransactionInstrument } from "@/src/modules/finance/transactions/components/transaction-instrument"
import { TransactionStatusMark } from "@/src/modules/finance/transactions/components/transaction-status-mark"
import { useTransactionSearch } from "@/src/modules/finance/shared/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatFinanceTimeLabel } from "@/src/modules/finance/shared/lib/ledger-form"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  isTransferTransaction,
  movementSign,
  signedAmount,
  transferDirectionLabel,
} from "@/src/modules/finance/shared/lib/transactions-query"
import type { FinanceCategory } from "@/src/modules/finance/shared/types/entities"
import { Input } from "@/src/shared/components/ui/input"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { cn } from "@/src/shared/lib/utils"
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  ScaleIcon,
  SearchIcon,
} from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

const SEARCH_DEBOUNCE_MS = 300

type FinanceTransactionSearchProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
  categories: FinanceCategory[]
  onSelect: (id: string) => void
}

export function FinanceTransactionSearch({
  enabled,
  display,
  categories,
  onSelect,
}: FinanceTransactionSearchProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [closedFor, setClosedFor] = useState<string | null>(null)
  const open = debouncedSearch.length > 0 && closedFor !== debouncedSearch
  const resultsQuery = useTransactionSearch(enabled, debouncedSearch)
  const items = resultsQuery.data?.items ?? []
  const showPanel = open && debouncedSearch.length > 0
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const)
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setClosedFor(debouncedSearch)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [debouncedSearch])

  return (
    <div ref={rootRef} className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar comercio o descripción..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onFocus={() => {
          if (debouncedSearch.length > 0) {
            setClosedFor(null)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setClosedFor(debouncedSearch)
            event.currentTarget.blur()
          }
        }}
        autoComplete="off"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        className="pr-3 pl-8"
      />
      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Resultados de búsqueda"
          className="absolute top-full z-40 mt-1 max-h-72 w-full overflow-y-auto rounded-2xl border border-border bg-popover shadow-2xl"
        >
          {resultsQuery.isError ? (
            <p className="px-3 py-3 text-sm text-destructive">
              {financeErrorMessage(resultsQuery.error)}
            </p>
          ) : resultsQuery.isPending ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">Buscando…</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              Sin resultados
            </p>
          ) : (
            <div className="px-3">
              {items.map((transaction, index) => {
                const isTransfer = isTransferTransaction(transaction)
                const category = transaction.categoryId
                  ? categoryById.get(transaction.categoryId)
                  : undefined
                const parent = category?.parentId
                  ? categoryById.get(category.parentId)
                  : undefined
                const icon = isTransfer
                  ? undefined
                  : category?.icon?.trim() || parent?.icon?.trim()
                const color = isTransfer
                  ? "#3B82F6"
                  : category?.color?.trim() ||
                    parent?.color?.trim() ||
                    "#64748B"
                const title = isTransfer
                  ? transferDirectionLabel(transaction)
                  : (transaction.merchant ??
                    transaction.description ??
                    transaction.accountName ??
                    "Movimiento")
                return (
                  <div key={transaction.id} role="option" aria-selected={false}>
                    <SummaryItem
                      title={title}
                      description={
                        transaction.accountName || transaction.cardName ? (
                          <TransactionInstrument
                            transaction={transaction}
                            suffix={formatFinanceTimeLabel(
                              transaction.transactionDate
                            )}
                          />
                        ) : undefined
                      }
                      leading={
                        icon ? (
                          <span>{icon}</span>
                        ) : isTransfer ? (
                          <ArrowLeftRightIcon className="size-5 text-info" />
                        ) : transaction.type === "DEBIT" ? (
                          <ArrowDownLeftIcon className="size-5 text-destructive" />
                        ) : transaction.type === "CREDIT" ? (
                          <ArrowUpRightIcon className="size-5 text-success" />
                        ) : transaction.type === "ADJUSTMENT" ? (
                          <ScaleIcon
                            className={cn(
                              "size-5",
                              movementSign(transaction) === "−"
                                ? "text-destructive"
                                : "text-success"
                            )}
                          />
                        ) : null
                      }
                      accentColor={color}
                      value={
                        <span
                          className={cn(
                            !isTransfer &&
                              movementSign(transaction) === "−" &&
                              "text-destructive",
                            !isTransfer &&
                              movementSign(transaction) === "+" &&
                              "text-success"
                          )}
                        >
                          {signedAmount(transaction, display)}
                        </span>
                      }
                      trailing={
                        <TransactionStatusMark status={transaction.status} />
                      }
                      showChevron={false}
                      onPress={() => {
                        setClosedFor(debouncedSearch)
                        onSelect(transaction.id)
                      }}
                      isLast={index === items.length - 1}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
