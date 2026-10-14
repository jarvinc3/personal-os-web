"use client"

import { BudgetSheet } from "@/src/modules/finance/budgets/components/budget-sheet"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceProgressHero } from "@/src/modules/finance/shared/components/layout/progress-hero"
import type { PlanningProgressTone } from "@/src/modules/finance/shared/components/planning-progress-card"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import {
  useBudget,
  useBudgetTransactions,
  useDeleteBudget,
  useRestoreBudget,
} from "@/src/modules/finance/shared/hooks/use-budgets"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { budgetPctUsed } from "@/src/modules/finance/shared/lib/budget-payloads"
import { formatBudgetPeriodDate } from "@/src/modules/finance/shared/lib/budgets-query"
import { filterCategoriesByType } from "@/src/modules/finance/shared/lib/category-tree"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import { joinPlanningCaption } from "@/src/modules/finance/shared/lib/planning-lists"
import {
  FINANCE_BUDGET_PERIOD_LABEL,
  FINANCE_TRANSACTION_STATUS_LABEL,
  type FinanceBudget,
  type FinanceTransactionStatus,
} from "@/src/modules/finance/shared/types/entities"
import { DeleteRecordDialog } from "@/src/modules/finance/shared/components/delete-record-dialog"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { ChatLauncherButton, useRegisterChatContext } from "@/src/modules/ai"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { ACCENT_FALLBACK_COLOR } from "@/src/shared/lib/accent-gradient"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ChartPieIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

const CONFIRMED_STATUS: FinanceTransactionStatus = "CONFIRMED"

function budgetTone(
  pct: number | null,
  threshold: number
): PlanningProgressTone {
  if (pct === null) {
    return "info"
  }
  if (pct >= 100) {
    return "danger"
  }
  if (pct >= threshold) {
    return "warning"
  }
  return "info"
}

function budgetBadge(tone: PlanningProgressTone): {
  label: string
  variant: "danger" | "warning" | "info"
} {
  if (tone === "danger") {
    return { label: "Excedido", variant: "danger" }
  }
  if (tone === "warning") {
    return { label: "Alerta", variant: "warning" }
  }
  return { label: "En curso", variant: "info" }
}

/** One budget can carry several categories; the title lists them. */
function budgetTitle(budget: FinanceBudget): string {
  const list =
    budget.categories && budget.categories.length > 0
      ? budget.categories
      : budget.category
        ? [budget.category]
        : []
  if (list.length === 0) {
    return budget.name ?? "Sin categoría"
  }
  return list.map((entry) => entry.name).join(", ")
}

/** Only a status other than confirmed is worth a caption on a movement. */
function movementStatusCaption(
  status: FinanceTransactionStatus
): string | undefined {
  if (status === CONFIRMED_STATUS) {
    return undefined
  }
  return FINANCE_TRANSACTION_STATUS_LABEL[status]
}

type FinanceBudgetDetailProps = {
  budgetId: string
}

export function BudgetDetailScreen({ budgetId }: FinanceBudgetDetailProps) {
  return (
    <FinanceGate>
      <BudgetDetailScreenBody budgetId={budgetId} />
    </FinanceGate>
  )
}

function BudgetDetailScreenBody({ budgetId }: FinanceBudgetDetailProps) {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const budgetQuery = useBudget(isEnabled, budgetId)
  const categoriesQuery = useCategories(isEnabled)
  const budget = budgetQuery.data ?? null
  const categories = filterCategoriesByType(
    categoriesQuery.data ?? [],
    "EXPENSE"
  )
  const { open: openBudgetSheet, setOpen: setOpenBudgetSheet } = useSheetParam(
    FINANCE_SHEET_KEYS.budget
  )

  const movementsQuery = useBudgetTransactions(isEnabled, budgetId)

  const movements = infiniteListItems(movementsQuery.data)
  const accent = budget?.category?.color ?? ACCENT_FALLBACK_COLOR
  const pct = budget
    ? budgetPctUsed(budget.amountSpent, budget.amountLimit)
    : null
  const progress = Math.min(100, Math.max(0, pct ?? 0))
  const remaining = budget
    ? (parseFinanceMoney(budget.amountLimit) ?? 0) -
      (parseFinanceMoney(budget.amountSpent) ?? 0)
    : 0
  const carriedOver = budget
    ? (parseFinanceMoney(budget.carriedOver ?? "0") ?? 0)
    : 0
  const effectiveLimit = budget
    ? (parseFinanceMoney(budget.effectiveLimit ?? budget.amountLimit) ?? 0)
    : 0
  const budgetTitleText = budget ? budgetTitle(budget) : "Presupuesto"
  const tone = budget ? budgetTone(pct, budget.alertThresholdPct ?? 80) : "info"
  const badge = budgetBadge(tone)

  useRegisterChatContext(
    budget
      ? {
          moduleSlug: "finance",
          screen: "budget-detail",
          entityRef: { type: "budget", id: budget.id },
          entityLabel: budgetTitleText,
        }
      : null
  )
  const deleteBudget = useDeleteBudget()
  const restoreBudget = useRestoreBudget()
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function onDeleteBudget() {
    if (!budget) {
      return
    }
    try {
      const budgetId = budget.id
      await deleteBudget.mutateAsync(budgetId)
      setConfirmOpen(false)
      setOptionsOpen(false)
      router.push(APP_ROUTES.app.financePlanning)
      showUndoToast("Presupuesto eliminado", () =>
        restoreBudget.mutate(budgetId, {
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
      <>
        <ChatLauncherButton />
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full"
          aria-label="Opciones del presupuesto"
          onClick={() => setOptionsOpen(true)}
        >
          <MoreVerticalIcon className="size-4.5" />
        </Button>
      </>
    ),
    [setOptionsOpen]
  )

  usePageHeader(
    {
      variant: "secondary",
      title: budgetTitleText,
      onBack: () => router.back(),
      actions: headerActions,
      accentColor: accent,
    },
    [router, budgetTitleText, accent, headerActions]
  )

  if (budgetQuery.isPending && !budget) {
    return <LoadingView />
  }

  if (!budget) {
    return (
      <MissingRecord
        icon={ChartPieIcon}
        title="No encontramos este presupuesto"
        description="Puede que se haya borrado o que su periodo ya haya terminado."
        backHref={APP_ROUTES.app.financePlanning}
        backLabel="Volver a Planificación"
      />
    )
  }

  const periodLabel =
    FINANCE_BUDGET_PERIOD_LABEL[budget.periodType] ?? budget.periodType
  const periodRange = `${formatBudgetPeriodDate(budget.periodStart)} – ${formatBudgetPeriodDate(budget.periodEnd)}`
  const emoji = budget.category?.icon

  return (
    <>
      {budgetQuery.error ? (
        <div className="mb-3">
          <FinanceErrorState
            message={financeLoadErrorMessage(budgetQuery.error)}
            onRetry={() => void budgetQuery.refetch()}
            isRetrying={budgetQuery.isFetching}
          />
        </div>
      ) : null}

      <FinanceProgressHero
        accent={accent}
        media={
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg">
            {emoji ?? <ChartPieIcon className="size-6" />}
          </span>
        }
        title={budgetTitleText}
        badge={badge}
        subtitle={joinPlanningCaption(periodLabel, periodRange)}
        metricLabel="Gastado"
        metricValue={formatFinanceMoney(budget.amountSpent, display)}
        progress={progress}
        startCaption={`${Math.round(progress)}% del tope`}
        endCaption={
          carriedOver !== 0
            ? `Tope efectivo ${formatFinanceMoney(effectiveLimit, display)}`
            : `Tope ${formatFinanceMoney(budget.amountLimit, display)}`
        }
        footnote={
          <>
            {remaining < 0
              ? `Excedido en ${formatFinanceMoney(Math.abs(remaining), display)}`
              : `Quedan ${formatFinanceMoney(remaining, display)}`}
            {` · alerta al ${budget.alertThresholdPct}%`}
            {carriedOver !== 0
              ? ` · arrastre ${formatFinanceMoney(carriedOver, display)}`
              : ""}
          </>
        }
      />

      <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
        <h2 className="text-sm font-medium text-muted-foreground">
          Movimientos del periodo
        </h2>

        {movementsQuery.isError ? (
          <FinanceErrorState
            message={financeLoadErrorMessage(movementsQuery.error)}
            onRetry={() => void movementsQuery.refetch()}
            isRetrying={movementsQuery.isFetching}
          />
        ) : null}

        <AsyncRegion
          pending={movementsQuery.isPending}
          pendingFallback={<FinanceListSkeleton rows={4} />}
          empty={!movementsQuery.isError && movements.length === 0}
          emptyFallback={
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ChartPieIcon />
                </EmptyMedia>
                <EmptyTitle>Sin gastos en este periodo</EmptyTitle>
                <EmptyDescription>
                  Un gasto aparece aquí cuando tiene esta categoría y cae dentro
                  de las fechas del presupuesto.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          }
        >
          {movements.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card">
              {movements.map((movement, index) => (
                <SummaryItem
                  key={movement.id}
                  title={
                    movement.merchant ?? movement.description ?? "Movimiento"
                  }
                  description={joinPlanningCaption(
                    formatCalendarDate(movement.transactionDate),
                    movementStatusCaption(movement.status)
                  )}
                  value={formatFinanceMoney(movement.amount, {
                    ...display,
                    currency: movement.currency,
                  })}
                  isLast={index === movements.length - 1}
                />
              ))}
            </div>
          ) : null}
        </AsyncRegion>

        <InfiniteListSentinel
          hasNextPage={movementsQuery.hasNextPage}
          isFetchingNextPage={movementsQuery.isFetchingNextPage}
          onLoadMore={() => void movementsQuery.fetchNextPage()}
        />
      </div>

      <RecordOptionsSheet
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        description={budgetTitleText}
        options={[
          {
            id: "edit",
            title: "Editar presupuesto",
            icon: PencilIcon,
            onPress: () => {
              setOptionsOpen(false)
              setOpenBudgetSheet(true)
            },
          },
          {
            id: "delete",
            title: "Eliminar",
            icon: Trash2Icon,
            destructive: true,
            disabled: deleteBudget.isPending,
            onPress: () => setConfirmOpen(true),
          },
        ]}
      />

      <DeleteRecordDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        recordName={budgetTitleText}
        pending={deleteBudget.isPending}
        consequences="Deja de seguir el gasto de esa categoría. No se puede deshacer."
        onConfirm={() => void onDeleteBudget()}
      />

      <BudgetSheet
        open={openBudgetSheet}
        onOpenChange={setOpenBudgetSheet}
        budget={budget}
        categories={categories}
        pending={budgetQuery.isFetching}
      />
    </>
  )
}
