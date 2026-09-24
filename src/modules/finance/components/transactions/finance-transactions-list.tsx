"use client"

import { FinanceListSkeleton } from "@/src/modules/finance/components/layout/finance-list-skeleton";
import { FinanceFlowPills } from "@/src/modules/finance/components/transactions/finance-flow-pills";
import { FinanceMonthPicker } from "@/src/modules/finance/components/transactions/finance-month-picker";
import { FinanceMonthSection } from "@/src/modules/finance/components/transactions/finance-month-section";
import { FinanceTransactionSearch } from "@/src/modules/finance/components/transactions/finance-transaction-search";
import { TransactionDetailSheet } from "@/src/modules/finance/components/transactions/transaction-detail-sheet";
import { TransactionSheet } from "@/src/modules/finance/components/transactions/transaction-sheet";
import { TransferSheet } from "@/src/modules/finance/components/transactions/transfer-sheet";
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys";
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts";
import { useCards } from "@/src/modules/finance/hooks/use-cards";
import { useCategories } from "@/src/modules/finance/hooks/use-categories";
import { useSheetQueryEntity } from "@/src/modules/finance/hooks/use-sheet-entity";
import {
  useTimelineTransactions,
  useTransaction,
} from "@/src/modules/finance/hooks/use-transactions";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import { buildTimelineMonths } from "@/src/modules/finance/lib/group-transactions-timeline";
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import {
  extendMonthRange,
  initialMonthRange,
  listYearMonths,
  monthKeyFromDate,
  parseMonthKey,
  yearsTouched,
  type MonthKey,
} from "@/src/modules/finance/lib/month-window";
import {
  animateScrollSectionIntoView,
  findActiveMonthKey,
  getScrollParent,
  scrollSectionIntoView,
} from "@/src/modules/finance/lib/timeline-scroll";
import { FINANCE_TRANSACTIONS_QUERY_KEY } from "@/src/modules/finance/types/api";
import { ExpandableFab } from "@/src/shared/components/layout/expandable-fab";
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params";
import { appToast } from "@/src/shared/lib/app-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRightIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type FinanceTransactionsListProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
}

const STICKY_GAP = 8
const PROGRAMMATIC_SCROLL_MS = 1600

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function FinanceTransactionsList({
  enabled,
  display,
}: FinanceTransactionsListProps) {
  const [range, setRange] = useState(() => initialMonthRange())
  const [activeMonthKey, setActiveMonthKey] = useState<MonthKey>(() =>
    monthKeyFromDate(new Date())
  )
  const [stickyOffset, setStickyOffset] = useState(0)
  const chromeRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScroll = useRef(false)
  const programmaticTimer = useRef(0)
  const didInitialScroll = useRef(false)
  const programmaticTarget = useRef<MonthKey | null>(null)
  const scrollGeneration = useRef(0)
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
    [range.from, range.to]
  )
  const years = useMemo(
    () => yearsTouched(range.from, range.to),
    [range.from, range.to]
  )

  const timelineQuery = useTimelineTransactions(enabled, years, {})
  const timeline = useMemo(
    () => buildTimelineMonths(months, timelineQuery.items),
    [months, timelineQuery.items]
  )
  const activeMonth = timeline.find((month) => month.key === activeMonthKey)
  const editingQuery = useTransaction(
    enabled && openTransactionSheet && Boolean(transactionSheetId),
    transactionSheetId
  )
  const editing = useSheetQueryEntity(
    openTransactionSheet,
    transactionSheetId,
    editingQuery,
    setOpenTransactionSheet
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

  const scrollToMonth = useCallback(
    (key: MonthKey) => {
      programmaticTarget.current = key
      applyActiveMonth(key)
    },
    [applyActiveMonth]
  )

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
    const isInitial = !didInitialScroll.current
    const targetKey = isInitial ? activeMonthKey : programmaticTarget.current
    if (!targetKey || stickyOffset === 0 || !timelineRef.current) return
    const section = timelineRef.current.querySelector<HTMLElement>(
      `[data-month-key="${targetKey}"]`
    )
    if (!section) return

    const generation = ++scrollGeneration.current
    const parent = getScrollParent(section)
    const offset = stickyOffset + STICKY_GAP
    isProgrammaticScroll.current = true

    const release = () => {
      if (scrollGeneration.current !== generation) return
      isProgrammaticScroll.current = false
      programmaticTarget.current = null
      didInitialScroll.current = true
      window.clearTimeout(programmaticTimer.current)
    }

    let cancelAnimation = () => { }
    const stopForUser = () => {
      if (scrollGeneration.current !== generation) return
      scrollGeneration.current += 1
      cancelAnimation()
      programmaticTarget.current = null
      didInitialScroll.current = true
      isProgrammaticScroll.current = false
      window.clearTimeout(programmaticTimer.current)
    }
    parent?.addEventListener("wheel", stopForUser, { passive: true })
    parent?.addEventListener("touchstart", stopForUser, { passive: true })

    if (isInitial || prefersReducedMotion()) {
      scrollSectionIntoView(section, offset, "auto")
      programmaticTimer.current = window.setTimeout(release, 80)
    } else {
      cancelAnimation = animateScrollSectionIntoView(section, offset, release)
      programmaticTimer.current = window.setTimeout(
        release,
        PROGRAMMATIC_SCROLL_MS
      )
    }

    return () => {
      cancelAnimation()
      window.clearTimeout(programmaticTimer.current)
      parent?.removeEventListener("wheel", stopForUser)
      parent?.removeEventListener("touchstart", stopForUser)
      if (scrollGeneration.current === generation) {
        scrollGeneration.current += 1
      }
      const willRetry =
        programmaticTarget.current != null || !didInitialScroll.current
      if (!willRetry) isProgrammaticScroll.current = false
    }
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
      const sections = [
        ...node.querySelectorAll<HTMLElement>("[data-month-key]"),
      ]
        .map((section) => ({
          key: section.getAttribute("data-month-key") ?? "",
          top: section.getBoundingClientRect().top - parentTop,
        }))
        .filter((section) => section.key)
      const nextKey = findActiveMonthKey(sections, stickyOffset + STICKY_GAP)
      if (nextKey) {
        setActiveMonthKey((current) =>
          current === nextKey ? current : nextKey
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
        className="flex sticky top-0 z-30 flex-col gap-3 pb-2 bg-background"
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
