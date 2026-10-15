"use client"

import { TransactionMovementRow } from "@/src/modules/finance/transactions/components/transaction-movement-row"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { useTransactionSearch } from "@/src/modules/finance/shared/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { FinanceCategory } from "@/src/modules/finance/shared/types/entities"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Input } from "@/src/shared/components/ui/input"
import { Separator } from "@/src/shared/components/ui/separator"
import { cn } from "@/src/shared/lib/utils"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { SearchIcon, XIcon } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

const PRESENCE_EASE = [0.22, 1, 0.36, 1] as const

const SEARCH_DEBOUNCE_MS = 300

function wheelDelta(event: WheelEvent, node: HTMLElement) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16
  }
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * node.clientHeight
  }
  return event.deltaY
}

function containResultsWheel(event: WheelEvent) {
  const node = event.currentTarget
  if (!(node instanceof HTMLElement)) {
    return
  }
  const max = node.scrollHeight - node.clientHeight
  if (max > 0) {
    node.scrollTop = Math.min(
      max,
      Math.max(0, node.scrollTop + wheelDelta(event, node))
    )
  }
  event.preventDefault()
  event.stopPropagation()
}

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
  const resultsRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion() === true
  const presence = { duration: reduceMotion ? 0 : 0.2, ease: PRESENCE_EASE }
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [closedFor, setClosedFor] = useState<string | null>(null)
  const open = debouncedSearch.length > 0 && closedFor !== debouncedSearch
  const resultsQuery = useTransactionSearch(enabled, debouncedSearch)
  const items = resultsQuery.data?.items ?? []
  const showPanel = open && debouncedSearch.length > 0

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const node = resultsRef.current
    if (!showPanel || !node) {
      return
    }
    node.addEventListener("wheel", containResultsWheel, { passive: false })
    return () => node.removeEventListener("wheel", containResultsWheel)
  }, [showPanel])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setClosedFor(debouncedSearch)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [debouncedSearch])

  function close() {
    setClosedFor(debouncedSearch)
  }

  function clearSearch() {
    setSearch("")
    setDebouncedSearch("")
    setClosedFor(null)
  }

  return (
    <>
      <AnimatePresence>
        {showPanel ? (
          <motion.button
            key="search-backdrop"
            type="button"
            aria-label="Cerrar búsqueda"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={presence}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm"
            onClick={close}
          />
        ) : null}
      </AnimatePresence>
      <div ref={rootRef} className="relative z-50 mx-2 md:mx-0">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
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
              close()
              event.currentTarget.blur()
            }
          }}
          autoComplete="on"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          className={cn(
            "relative z-10 pr-5 pl-9",
            showPanel && "rounded-t-2xl rounded-b-none"
          )}
        />
        <AnimatePresence>
          {showPanel ? (
          <motion.div
            key="search-results"
            id={listId}
            role="listbox"
            aria-label="Resultados de búsqueda"
            initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            transition={presence}
            className="absolute inset-x-0 top-full z-50 flex h-[50vh] min-h-[50vh] flex-col overflow-hidden rounded-t-none rounded-b-2xl border border-t-0 border-border bg-popover shadow-2xl"
          >
            <Separator />
            <div
              ref={resultsRef}
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain p-2"
            >
            {resultsQuery.isError ? (
              <FinanceErrorState
                message={financeErrorMessage(resultsQuery.error)}
                onRetry={() => void resultsQuery.refetch()}
                isRetrying={resultsQuery.isFetching}
              />
            ) : resultsQuery.isPending ? (
              <FinanceListSkeleton rows={3} />
            ) : items.length === 0 ? (
              <Empty className="py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchIcon />
                  </EmptyMedia>
                  <EmptyTitle>Sin resultados</EmptyTitle>
                  <EmptyDescription>
                    Ningún movimiento coincide con «{debouncedSearch}».
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button type="button" size="sm" variant="outline" onClick={clearSearch}>
                    <XIcon />
                    Limpiar
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              items.map((transaction) => (
                <div
                  key={transaction.id}
                  role="option"
                  aria-selected={false}
                  className="shrink-0 overflow-hidden rounded-2xl border border-border"
                >
                  <TransactionMovementRow
                    transaction={transaction}
                    categories={categories}
                    display={display}
                    onPress={() => {
                      close()
                      onSelect(transaction.id)
                    }}
                  />
                </div>
              ))
            )}
            </div>
          </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  )
}
