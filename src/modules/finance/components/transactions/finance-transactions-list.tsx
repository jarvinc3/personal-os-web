"use client"

import { FinanceFlowPills } from "@/src/modules/finance/components/transactions/finance-flow-pills"
import { FinanceMonthPicker } from "@/src/modules/finance/components/transactions/finance-month-picker"
import { FinanceMonthSection } from "@/src/modules/finance/components/transactions/finance-month-section"
import { TransactionDetailSheet } from "@/src/modules/finance/components/transactions/transaction-detail-sheet"
import {
  countActiveTransactionFilters,
  INITIAL_TRANSACTION_FILTERS,
  TransactionFiltersSheet,
  type TransactionFilterState,
} from "@/src/modules/finance/components/transactions/transaction-filters-sheet"
import { TransactionSheet } from "@/src/modules/finance/components/transactions/transaction-sheet"
import { TransferSheet } from "@/src/modules/finance/components/transactions/transfer-sheet"
import { FinanceListSkeleton } from "@/src/modules/finance/components/layout/finance-list-skeleton"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import { useCategories } from "@/src/modules/finance/hooks/use-categories"
import { useSheetQueryEntity } from "@/src/modules/finance/hooks/use-sheet-entity"
import {
  useTimelineTransactions,
  useTransaction,
} from "@/src/modules/finance/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { buildTimelineMonths } from "@/src/modules/finance/lib/group-transactions-timeline"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import {
  extendMonthRange,
  initialMonthRange,
  listYearMonths,
  monthKeyFromDate,
  parseMonthKey,
  yearsTouched,
  type MonthKey,
} from "@/src/modules/finance/lib/month-window"
import {
  FINANCE_TX_FILTER_ALL,
  type FinanceTransactionsQuery,
} from "@/src/modules/finance/lib/transactions-query"
import {
  FINANCE_TRANSACTION_STATUS_LABEL,
  FINANCE_TRANSACTION_STATUSES,
  FINANCE_TRANSACTION_TYPE_LABEL,
  FINANCE_TRANSACTION_TYPES,
  type FinanceTransactionStatus,
  type FinanceTransactionType,
} from "@/src/modules/finance/types/entities"
import { ExpandableFab } from "@/src/shared/components/layout/expandable-fab"
import { FilterSearchToolbar } from "@/src/shared/components/layout/filters"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import {
  ArrowLeftRightIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

type FinanceTransactionsListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
}

const SEARCH_DEBOUNCE_MS = 300
const PROGRAMMATIC_SCROLL_MS = 700

function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null
  while (current) {
    const overflowY = getComputedStyle(current).overflowY
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight
    ) {
      return current
    }
    current = current.parentElement
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement
}

function scrollSectionIntoView(
  section: HTMLElement,
  offset: number,
  behavior: ScrollBehavior = "smooth",
) {
  const parent = getScrollParent(section)
  if (!parent) {
    section.scrollIntoView({ block: "start", behavior })
    return
  }
  const parentTop =
    parent === document.documentElement || parent === document.body
      ? 0
      : parent.getBoundingClientRect().top
  const delta = section.getBoundingClientRect().top - parentTop - offset
  parent.scrollBy({ top: delta, behavior })
}

export function FinanceTransactionsList({
  enabled,
  display,
}: FinanceTransactionsListProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filters, setFilters] = useState<TransactionFilterState>(
    INITIAL_TRANSACTION_FILTERS,
  )
  const [range, setRange] = useState(() => initialMonthRange())
  const [activeMonthKey, setActiveMonthKey] = useState<MonthKey>(() =>
    monthKeyFromDate(new Date()),
  )
  const [stickyOffset, setStickyOffset] = useState(0)
  const chromeRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScroll = useRef(false)
  const didInitialScroll = useRef(false)
  const { open: openFilterSheet, setOpen: setOpenFilterSheet } = useSheetParam(
    FINANCE_SHEET_KEYS.transactionFilters,
  )
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
  const categoriesQuery = useCategories(enabled)
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const hasTargets = accounts.length > 0 || cards.length > 0
  const canTransfer = accounts.length + cards.length >= 2

  const months = useMemo(
    () => listYearMonths(range.from, range.to),
    [range.from, range.to],
  )
  const years = useMemo(
    () => yearsTouched(range.from, range.to),
    [range.from, range.to],
  )

  const timelineFilters = useMemo<
    Omit<FinanceTransactionsQuery, "page" | "limit">
  >(
    () => ({
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
    [filters, debouncedSearch],
  )

  const timelineQuery = useTimelineTransactions(
    enabled,
    years,
    timelineFilters,
  )
  const timeline = useMemo(
    () => buildTimelineMonths(months, timelineQuery.items),
    [months, timelineQuery.items],
  )
  const activeMonth = timeline.find((month) => month.key === activeMonthKey)
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

  const scrollToMonth = useCallback((key: MonthKey) => {
    const section = timelineRef.current?.querySelector<HTMLElement>(
      `[data-month-key="${key}"]`,
    )
    if (!section) return
    isProgrammaticScroll.current = true
    setActiveMonthKey(key)
    scrollSectionIntoView(section, stickyOffset + 8, "smooth")
    window.setTimeout(() => {
      isProgrammaticScroll.current = false
    }, PROGRAMMATIC_SCROLL_MS)
  }, [stickyOffset])

  useLayoutEffect(() => {
    const chrome = chromeRef.current
    if (!chrome) return
    const update = () => setStickyOffset(chrome.offsetHeight)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(chrome)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (didInitialScroll.current || timeline.length === 0 || stickyOffset === 0) {
      return
    }
    const section = timelineRef.current?.querySelector<HTMLElement>(
      `[data-month-key="${activeMonthKey}"]`,
    )
    if (!section) return
    didInitialScroll.current = true
    isProgrammaticScroll.current = true
    scrollSectionIntoView(section, stickyOffset + 8, "auto")
    window.setTimeout(() => {
      isProgrammaticScroll.current = false
    }, PROGRAMMATIC_SCROLL_MS)
  }, [activeMonthKey, stickyOffset, timeline.length])

  useEffect(() => {
    const parsed = parseMonthKey(activeMonthKey)
    const active = new Date(parsed.year, parsed.month - 1, 1)
    setRange((current) => {
      const next = extendMonthRange(current, active)
      if (
        next.from.getTime() === current.from.getTime() &&
        next.to.getTime() === current.to.getTime()
      ) {
        return current
      }
      return next
    })
  }, [activeMonthKey])

  useEffect(() => {
    const rootNode = timelineRef.current
    if (!rootNode) return
    const scrollRoot = getScrollParent(rootNode)
    if (!scrollRoot) return

    let ticking = false
    function updateActiveMonth() {
      ticking = false
      if (isProgrammaticScroll.current) return
      const sections = [
        ...rootNode.querySelectorAll<HTMLElement>("[data-month-key]"),
      ]
      const marker = stickyOffset + 8
      let bestKey: string | null = null
      let bestScore = Number.POSITIVE_INFINITY
      for (const section of sections) {
        const score = Math.abs(section.getBoundingClientRect().top - marker)
        if (score < bestScore) {
          bestScore = score
          bestKey = section.getAttribute("data-month-key")
        }
      }
      if (bestKey) {
        setActiveMonthKey((current) => (current === bestKey ? current : bestKey))
      }
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(updateActiveMonth)
    }

    scrollRoot.addEventListener("scroll", onScroll, { passive: true })
    return () => scrollRoot.removeEventListener("scroll", onScroll)
  }, [stickyOffset, timeline.length])

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={chromeRef}
        className="sticky top-0 z-30 flex flex-col gap-3 bg-background pb-2"
      >
        <FilterSearchToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar comercio o descripción..."
          activeFilterCount={countActiveTransactionFilters(filters)}
          onFilterPress={() => setOpenFilterSheet(true)}
        />
        <FinanceMonthPicker
          months={months}
          activeMonthKey={activeMonthKey}
          onSelect={scrollToMonth}
        />
        <FinanceFlowPills
          income={activeMonth?.totals.income ?? 0}
          expenses={activeMonth?.totals.expenses ?? 0}
          display={display}
        />
      </div>

      {timelineQuery.isError ? (
        <p className="text-sm text-destructive">
          {financeErrorMessage(timelineQuery.error)}
        </p>
      ) : null}

      {timelineQuery.isPending && timelineQuery.items.length === 0 ? (
        <FinanceListSkeleton rows={4} />
      ) : null}

      <div ref={timelineRef} className="flex flex-col gap-8">
        {timeline.map((month) => (
          <FinanceMonthSection
            key={month.key}
            month={month}
            categories={categories}
            display={display}
            isActive={month.key === activeMonthKey}
            stickyOffset={stickyOffset + 8}
            onTransactionPress={(id) => setOpenDetailSheet(true, id)}
          />
        ))}
      </div>

      <ExpandableFab
        actions={[
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
        ]}
      />

      <TransactionFiltersSheet
        open={openFilterSheet}
        onOpenChange={setOpenFilterSheet}
        filters={filters}
        onApply={setFilters}
        accountOptions={accountOptions}
        cardOptions={cardOptions}
        typeOptions={typeOptions}
        statusOptions={statusOptions}
      />

      <TransactionDetailSheet
        open={openDetailSheet}
        onOpenChange={setOpenDetailSheet}
        transactionId={detailSheetId}
        enabled={enabled}
        display={display}
        onEdit={(transaction) => {
          setOpenTransactionSheet(true, transaction.id)
        }}
      />

      <TransactionSheet
        open={openTransactionSheet}
        onOpenChange={setOpenTransactionSheet}
        pending={Boolean(transactionSheetId) && !editing}
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
