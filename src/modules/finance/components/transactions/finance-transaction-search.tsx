"use client"

import { useTransactionSearch } from "@/src/modules/finance/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/lib/money"
import {
  formatTransactionDate,
  isTransferTransaction,
  transferDirectionLabel,
} from "@/src/modules/finance/lib/transactions-query"
import {
  FINANCE_TRANSACTION_STATUS_LABEL,
  type FinanceCategory,
  type FinanceTransaction,
} from "@/src/modules/finance/types/entities"
import { Input } from "@/src/shared/components/ui/input"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { cn } from "@/src/shared/lib/utils"
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
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

function signedAmount(
  transaction: FinanceTransaction,
  display: FinanceMoneyDisplay,
): string {
  const parsed = parseFinanceMoney(transaction.amount)
  const formatted = formatFinanceMoney(
    parsed === null ? null : Math.abs(parsed),
    { ...display, currency: transaction.currency },
  )
  if (isTransferTransaction(transaction)) return formatted
  if (transaction.type === "DEBIT") return `− ${formatted}`
  if (transaction.type === "CREDIT") return `+ ${formatted}`
  return formatted
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
  const [open, setOpen] = useState(false)
  const resultsQuery = useTransactionSearch(enabled, debouncedSearch)
  const items = resultsQuery.data?.items ?? []
  const showPanel = open && debouncedSearch.length > 0
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const),
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setOpen(debouncedSearch.length > 0)
  }, [debouncedSearch])

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  return (
    <div ref={rootRef} className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar comercio o descripción..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onFocus={() => {
          if (debouncedSearch.length > 0) setOpen(true)
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false)
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
            <p className="px-3 py-3 text-sm text-muted-foreground">
              Buscando…
            </p>
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
                  <div key={transaction.id} role="option">
                    <SummaryItem
                      title={title}
                      description={`${formatTransactionDate(transaction.transactionDate)} · ${FINANCE_TRANSACTION_STATUS_LABEL[transaction.status]}`}
                      leading={
                        icon ? (
                          <span>{icon}</span>
                        ) : isTransfer ? (
                          <ArrowLeftRightIcon className="size-5 text-info" />
                        ) : transaction.type === "DEBIT" ? (
                          <ArrowDownLeftIcon className="size-5 text-destructive" />
                        ) : transaction.type === "CREDIT" ? (
                          <ArrowUpRightIcon className="size-5 text-success" />
                        ) : null
                      }
                      accentColor={color}
                      value={
                        <span
                          className={cn(
                            !isTransfer &&
                              transaction.type === "DEBIT" &&
                              "text-destructive",
                            !isTransfer &&
                              transaction.type === "CREDIT" &&
                              "text-success",
                          )}
                        >
                          {signedAmount(transaction, display)}
                        </span>
                      }
                      onPress={() => {
                        setOpen(false)
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
