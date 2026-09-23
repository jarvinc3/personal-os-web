"use client"

import { FinanceFlowPills } from "@/src/modules/finance/components/transactions/finance-flow-pills"
import { FinanceMonthPicker } from "@/src/modules/finance/components/transactions/finance-month-picker"
import { FinanceMonthSection } from "@/src/modules/finance/components/transactions/finance-month-section"
import { FinanceTransactionSearch } from "@/src/modules/finance/components/transactions/finance-transaction-search"
import { TransactionDetailSheet } from "@/src/modules/finance/components/transactions/transaction-detail-sheet"
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
import { FINANCE_TRANSACTIONS_QUERY_KEY } from "@/src/modules/finance/types/api"
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
  animateScrollSectionIntoView,
  findActiveMonthKey,
  getScrollParent,
  scrollSectionIntoView,
} from "@/src/modules/finance/lib/timeline-scroll"
import { ExpandableFab } from "@/src/shared/components/layout/expandable-fab"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import { useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeftRightIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
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

const STICKY_GAP = 8
const PROGRAMMATIC_SCROLL_MS = 1800

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function beginProgrammaticScroll(
  flag: { current: boolean },
  timer: { current: number },
  parent: HTMLElement | null,
) {
  flag.current = true
  window.clearTimeout(timer.current)
  const finish = () => {
    window.clearTimeout(timer.current)
    parent?.removeEventListener("scrollend", finish)
    flag.current = false
  }
  parent?.addEventListener("scrollend", finish, { once: true })
  timer.current = window.setTimeout(finish, PROGRAMMATIC_SCROLL_MS)
}

export function FinanceTransactionsList({
  enabled,
  display,
}: FinanceTransactionsListProps) {
  const [range, setRange] = useState(() => initialMonthRange())
  const [activeMonthKey, setActiveMonthKey] = useState<MonthKey>(() =>
    monthKeyFromDate(new Date()),
  )
  const [stickyOffset, setStickyOffset] = useState(0)
  const chromeRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScroll = useRef(false)
  const programmaticTimer = useRef(0)
  const didInitialScroll = useRef(false)
  const pendingScrollKey = useRef<MonthKey | null>(null)
  const pendingScrollHeight = useRef<number | null>(null)
  const currentMonthKey = monthKeyFromDate(new Date())
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
  const queryClient = useQueryClient()
  const sheetsOpen =
    openDetailSheet || openTransactionSheet || openTransferSheet

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

  const timelineQuery = useTimelineTransactions(enabled, years, {})
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

  const applyActiveMonth = useCallback((key: MonthKey) => {
    setActiveMonthKey(key)
    const parsed = parseMonthKey(key)
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
  }, [])

  const scrollToMonth = useCallback((key: MonthKey) => {
    pendingScrollKey.current = key
    pendingScrollHeight.current =
      getScrollParent(timelineRef.current)?.scrollHeight ?? null
    applyActiveMonth(key)
  }, [applyActiveMonth])

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
    if (didInitialScroll.current || stickyOffset === 0 || !timelineRef.current) {
      return
    }
    if (timeline.length === 0) return
    const section = timelineRef.current.querySelector<HTMLElement>(
      `[data-month-key="${activeMonthKey}"]`,
    )
    if (!section) return
    didInitialScroll.current = true
    beginProgrammaticScroll(
      isProgrammaticScroll,
      programmaticTimer,
      getScrollParent(section),
    )
    scrollSectionIntoView(section, stickyOffset + STICKY_GAP, "auto")
  }, [activeMonthKey, stickyOffset, timeline.length])

  useEffect(() => {
    if (!didInitialScroll.current || stickyOffset === 0) return
    const key = pendingScrollKey.current
    if (!key) return
    const section = timelineRef.current?.querySelector<HTMLElement>(
      `[data-month-key="${key}"]`,
    )
    if (!section) return
    pendingScrollKey.current = null
    const parent = getScrollParent(section)
    const previousHeight = pendingScrollHeight.current
    pendingScrollHeight.current = null
    if (parent && previousHeight != null) {
      const grown = parent.scrollHeight - previousHeight
      if (grown > 0) parent.scrollTop += grown
    }
    beginProgrammaticScroll(isProgrammaticScroll, programmaticTimer, parent)
    if (prefersReducedMotion()) {
      scrollSectionIntoView(section, stickyOffset + STICKY_GAP, "auto")
      return
    }
    const cancel = animateScrollSectionIntoView(
      section,
      stickyOffset + STICKY_GAP,
    )
    return cancel
  }, [activeMonthKey, months, stickyOffset, timeline.length])

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
      if (isProgrammaticScroll.current || sheetsOpen) return
      const node = timelineRef.current
      if (!node) return
      const parent = getScrollParent(node)
      if (!parent) return
      const parentTop =
        parent === document.documentElement || parent === document.body
          ? 0
          : parent.getBoundingClientRect().top
      const sections = [...node.querySelectorAll<HTMLElement>("[data-month-key]")]
        .map((section) => ({
          key: section.getAttribute("data-month-key") ?? "",
          top: section.getBoundingClientRect().top - parentTop,
        }))
        .filter((section) => section.key)
      const nextKey = findActiveMonthKey(sections, stickyOffset + STICKY_GAP)
      if (nextKey) {
        setActiveMonthKey((current) =>
          current === nextKey ? current : nextKey,
        )
      }
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(updateActiveMonth)
    }

    scrollRoot.addEventListener("scroll", onScroll, { passive: true })
    return () => scrollRoot.removeEventListener("scroll", onScroll)
  }, [stickyOffset, timeline.length, sheetsOpen])

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={chromeRef}
        className="sticky top-0 z-30 flex flex-col gap-3 bg-background pb-2"
      >
        <FinanceTransactionSearch
          enabled={enabled}
          display={display}
          categories={categories}
          onSelect={(id) => setOpenDetailSheet(true, id)}
        />
        <FinanceMonthPicker
          months={months}
          activeMonthKey={activeMonthKey}
          currentMonthKey={currentMonthKey}
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
            stickyOffset={stickyOffset + STICKY_GAP}
            onTransactionPress={(id) => setOpenDetailSheet(true, id)}
          />
        ))}
      </div>

      <ExpandableFab
        actions={[
          {
            icon: <RefreshCwIcon />,
            label: "Actualizar",
            onClick: () => {
              void queryClient
                .invalidateQueries({ queryKey: FINANCE_TRANSACTIONS_QUERY_KEY })
                .then(() => {
                  appToast.success({ text1: "Movimientos actualizados" })
                })
                .catch((error: unknown) => {
                  appToast.error({ text1: financeErrorMessage(error) })
                })
            },
            disabled: !enabled || timelineQuery.isFetching,
            color: "bg-slate-600",
          },
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
