"use client"

import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { QuickEntryBar } from "@/src/modules/finance/quick-entry"
import { MonthFlowSummary } from "@/src/modules/finance/shared/components/month-flow-summary"
import { FinanceMonthPicker } from "@/src/modules/finance/transactions/components/month-picker"
import { FinanceMonthSection } from "@/src/modules/finance/transactions/components/month-section"
import { FinanceTransactionSearch } from "@/src/modules/finance/transactions/components/transaction-search"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useLoans } from "@/src/modules/finance/shared/hooks/use-loans"
import { useSubscriptionsUpcoming } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useTimelineTransactions } from "@/src/modules/finance/shared/hooks/use-transactions"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { buildTimelineMonths } from "@/src/modules/finance/shared/lib/group-transactions-timeline"
import { useWeekStartsOn } from "@/src/modules/settings/hooks/use-week-starts-on"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  extendMonthRange,
  initialMonthRange,
  listYearMonths,
  monthKeyFromDate,
  parseMonthKey,
  yearsTouched,
  type MonthKey,
} from "@/src/modules/finance/shared/lib/month-window"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  groupCommitmentsByMonth,
  loanCommitments,
  subscriptionCommitments,
} from "@/src/modules/finance/transactions/lib/scheduled-commitments"
import {
  animateScrollSectionIntoView,
  findActiveMonthKey,
  getScrollParent,
  pickLandingDayKey,
  scrollSectionIntoView,
  shouldFollowScroll,
} from "@/src/modules/finance/shared/lib/timeline-scroll"
import { FINANCE_TRANSACTIONS_QUERY_KEY } from "@/src/modules/finance/shared/types/api"
import { ExpandableFab } from "@/src/shared/components/fab/expandable-fab"
import {
  APP_ROUTES,
  financeTransactionNewHref,
} from "@/src/shared/constants/app-routes"
import { appToast } from "@/src/shared/lib/app-toast"
import { useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeftRightIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
} from "lucide-react"
import { endOfMonth, format } from "date-fns"
import { useRouter } from "next/navigation"
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
const PROGRAMMATIC_SCROLL_MS = 1600

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function FinanceTransactionsList({
  enabled,
  display,
}: FinanceTransactionsListProps) {
  const [range, setRange] = useState(() => initialMonthRange())
  const [landingMonthKey] = useState(() => monthKeyFromDate(new Date()))
  const [activeMonthKey, setActiveMonthKey] =
    useState<MonthKey>(landingMonthKey)
  const [userTookOver, setUserTookOver] = useState(false)
  const userTookOverRef = useRef(false)
  if (!userTookOver && activeMonthKey !== landingMonthKey) {
    setActiveMonthKey(landingMonthKey)
  }
  const [rangeMonthKey, setRangeMonthKey] = useState(activeMonthKey)
  if (rangeMonthKey !== activeMonthKey) {
    setRangeMonthKey(activeMonthKey)
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
  }
  const [stickyOffset, setStickyOffset] = useState(0)
  const chromeRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScroll = useRef(false)
  const programmaticTimer = useRef(0)
  const programmaticTarget = useRef<MonthKey | null>(null)
  const scrollGeneration = useRef(0)
  const currentMonthKey = monthKeyFromDate(new Date())
  const router = useRouter()
  const queryClient = useQueryClient()

  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const categoriesQuery = useCategories(enabled)
  const loansQuery = useLoans(enabled)
  const today = todayDateInput()
  const upcomingQuery = useSubscriptionsUpcoming(enabled, {
    from: today,
    to: format(endOfMonth(range.to), "yyyy-MM-dd"),
  })
  const commitments = useMemo(
    () => [
      ...loanCommitments({
        loans: loansQuery.data ?? [],
        fromDate: today,
      }),
      ...subscriptionCommitments(upcomingQuery.data?.items ?? []),
    ],
    [loansQuery.data, upcomingQuery.data?.items, today]
  )
  const commitmentsByMonth = useMemo(
    () => groupCommitmentsByMonth(commitments),
    [commitments]
  )
  const commitmentsError = loansQuery.error ?? upcomingQuery.error
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

  const timelineQuery = useTimelineTransactions(
    enabled,
    years,
    {},
    currentMonthKey
  )
  const weekStartsOn = useWeekStartsOn()
  const timeline = useMemo(
    () =>
      buildTimelineMonths({
        months,
        items: timelineQuery.items,
        weekStartsOn,
        locale: display.locale,
      }),
    [months, timelineQuery.items, weekStartsOn, display.locale]
  )
  const activeMonth = timeline.find((month) => month.key === activeMonthKey)

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

  const markUserTookOver = useCallback(() => {
    if (userTookOverRef.current) {
      return
    }
    userTookOverRef.current = true
    setUserTookOver(true)
  }, [])

  const scrollToMonth = useCallback(
    (key: MonthKey) => {
      markUserTookOver()
      programmaticTarget.current = key
      applyActiveMonth(key)
    },
    [applyActiveMonth, markUserTookOver]
  )

  useLayoutEffect(() => {
    const chrome = chromeRef.current
    if (!chrome) {
      return
    }
    const update = () => setStickyOffset(chrome.offsetHeight)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(chrome)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (userTookOver) {
      return
    }
    const node = timelineRef.current
    if (!node || stickyOffset === 0) {
      return
    }

    const offset = stickyOffset + STICKY_GAP
    const pin = () => {
      if (userTookOverRef.current) {
        return
      }
      const month = node.querySelector<HTMLElement>(
        `[data-month-key="${landingMonthKey}"]`
      )
      if (!month) {
        return
      }
      const dayKeys = [
        ...month.querySelectorAll<HTMLElement>("[data-day-key]"),
      ].flatMap((day) => {
        const key = day.getAttribute("data-day-key")
        return key ? [key] : []
      })
      const dayKey = pickLandingDayKey(dayKeys, todayDateInput())
      const section = dayKey
        ? (month.querySelector<HTMLElement>(`[data-day-key="${dayKey}"]`) ??
          month)
        : month
      scrollSectionIntoView(section, offset, "auto")
    }

    pin()
    const observer = new ResizeObserver(pin)
    observer.observe(node)
    return () => observer.disconnect()
  }, [
    landingMonthKey,
    stickyOffset,
    timeline.length,
    timelineQuery.items.length,
    userTookOver,
  ])

  useLayoutEffect(() => {
    const targetKey = programmaticTarget.current
    if (!targetKey || stickyOffset === 0 || !timelineRef.current) {
      return
    }
    const section = timelineRef.current.querySelector<HTMLElement>(
      `[data-month-key="${targetKey}"]`
    )
    if (!section) {
      return
    }

    const generation = ++scrollGeneration.current
    const parent = getScrollParent(section)
    const offset = stickyOffset + STICKY_GAP
    isProgrammaticScroll.current = true

    const release = () => {
      if (scrollGeneration.current !== generation) {
        return
      }
      isProgrammaticScroll.current = false
      programmaticTarget.current = null
      window.clearTimeout(programmaticTimer.current)
    }

    let cancelAnimation = () => {}
    const stopForUser = () => {
      if (scrollGeneration.current !== generation) {
        return
      }
      scrollGeneration.current += 1
      cancelAnimation()
      programmaticTarget.current = null
      isProgrammaticScroll.current = false
      window.clearTimeout(programmaticTimer.current)
    }
    parent?.addEventListener("wheel", stopForUser, { passive: true })
    parent?.addEventListener("touchstart", stopForUser, { passive: true })

    if (prefersReducedMotion()) {
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
      if (programmaticTarget.current == null) {
        isProgrammaticScroll.current = false
      }
    }
  }, [activeMonthKey, months, stickyOffset, timeline.length])

  useEffect(() => {
    const rootNode = timelineRef.current
    if (!rootNode) {
      return
    }
    const scrollRoot = getScrollParent(rootNode)
    if (!scrollRoot) {
      return
    }

    let ticking = false
    function updateActiveMonth() {
      ticking = false
      if (
        !shouldFollowScroll({
          isProgrammatic: isProgrammaticScroll.current,
          userTookOver: userTookOverRef.current,
        })
      ) {
        return
      }
      const node = timelineRef.current
      if (!node) {
        return
      }
      const parent = getScrollParent(node)
      if (!parent) {
        return
      }
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
      if (ticking) {
        return
      }
      ticking = true
      requestAnimationFrame(updateActiveMonth)
    }

    scrollRoot.addEventListener("wheel", markUserTookOver, { passive: true })
    scrollRoot.addEventListener("touchstart", markUserTookOver, {
      passive: true,
    })
    scrollRoot.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      scrollRoot.removeEventListener("wheel", markUserTookOver)
      scrollRoot.removeEventListener("touchstart", markUserTookOver)
      scrollRoot.removeEventListener("scroll", onScroll)
    }
  }, [markUserTookOver, stickyOffset, timeline.length])

  return (
    <div className="-mx-4 flex flex-col bg-card md:mx-0 md:bg-background">
      <div
        ref={chromeRef}
        className="sticky top-0 z-30 flex flex-col gap-3 rounded-b-2xl border-b border-border/70 bg-background pb-2 shadow-sm md:border-none"
      >
        <FinanceTransactionSearch
          enabled={enabled}
          display={display}
          categories={categories}
          onSelect={(id) => router.push(APP_ROUTES.app.financeTransaction(id))}
        />
        <QuickEntryBar />
        <FinanceMonthPicker
          months={months}
          activeMonthKey={activeMonthKey}
          currentMonthKey={currentMonthKey}
          locale={display.locale}
          onSelect={scrollToMonth}
        />
        <MonthFlowSummary
          income={activeMonth?.totals.income}
          expenses={activeMonth?.totals.expenses}
          display={display}
        />
      </div>

      {timelineQuery.isError ? (
        <FinanceErrorState
          message={financeLoadErrorMessage(timelineQuery.error)}
          onRetry={() => {
            void queryClient.invalidateQueries({
              queryKey: FINANCE_TRANSACTIONS_QUERY_KEY,
            })
          }}
          isRetrying={timelineQuery.isFetching}
        />
      ) : null}

      {commitmentsError ? (
        <FinanceErrorState
          message={financeErrorMessage(commitmentsError)}
          onRetry={() => {
            void loansQuery.refetch()
            void upcomingQuery.refetch()
          }}
          isRetrying={loansQuery.isFetching || upcomingQuery.isFetching}
        />
      ) : null}

      {timelineQuery.isPending && timelineQuery.items.length === 0 ? (
        <FinanceListSkeleton rows={4} />
      ) : null}

      <div ref={timelineRef} className="flex flex-col">
        {timeline.map((month) => (
          <FinanceMonthSection
            key={month.key}
            month={month}
            categories={categories}
            display={display}
            isActive={month.key === activeMonthKey}
            scheduled={commitmentsByMonth.get(month.key) ?? []}
            stickyOffset={stickyOffset + STICKY_GAP}
          />
        ))}
      </div>

      <ExpandableFab
        actions={[
          {
            icon: <MinusIcon />,
            label: "Gasto",
            onClick: () =>
              router.push(financeTransactionNewHref({ type: "DEBIT" })),
            disabled: !enabled || !hasTargets,
            color: "bg-destructive",
          },
          {
            icon: <PlusIcon />,
            label: "Ingreso",
            onClick: () =>
              router.push(financeTransactionNewHref({ type: "CREDIT" })),
            disabled: !enabled || !hasTargets,
            color: "bg-success",
          },
          {
            icon: <ArrowLeftRightIcon />,
            label: "Transferir",
            onClick: () => router.push(APP_ROUTES.app.financeTransferNew),
            disabled: !enabled || !canTransfer,
            color: "bg-blue-500",
          },
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
            color: "bg-primary",
          },
        ]}
      />
    </div>
  )
}
