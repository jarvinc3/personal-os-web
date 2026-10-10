"use client"

import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { FinanceErrorState } from "@/src/modules/finance/components/layout/finance-error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/components/layout/finance-list-skeleton"
import { SavingsGoalContributionSheet } from "@/src/modules/finance/components/planning/savings-goal-contribution-sheet"
import { SavingsGoalSheet } from "@/src/modules/finance/components/planning/savings-goal-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import {
  useDeleteSavingsGoalContribution,
  useSavingsGoalContributions,
  useSavingsGoals,
} from "@/src/modules/finance/hooks/use-savings-goals"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/lib/finance-error"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/lib/money"
import {
  amountRatioPct,
  formatPlanningDate,
} from "@/src/modules/finance/lib/planning-lists"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  MoreVerticalIcon,
  PiggyBankIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

import { ACCENT_FALLBACK_COLOR } from "@/src/shared/lib/accent-gradient"

type FinanceSavingsGoalDetailProps = {
  goalId: string
}

export function FinanceSavingsGoalDetailClient({
  goalId,
}: FinanceSavingsGoalDetailProps) {
  return (
    <FinanceAuthenticatedPage>
      <FinanceSavingsGoalDetailView goalId={goalId} />
    </FinanceAuthenticatedPage>
  )
}

function FinanceSavingsGoalDetailView({
  goalId,
}: FinanceSavingsGoalDetailProps) {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const goalsQuery = useSavingsGoals(isEnabled)
  const contributionsQuery = useSavingsGoalContributions(isEnabled, goalId)
  const deleteContribution = useDeleteSavingsGoalContribution()
  const { open: openGoalSheet, setOpen: setOpenGoalSheet } = useSheetParam(
    FINANCE_SHEET_KEYS.savings
  )
  const { open: openContributionSheet, setOpen: setOpenContributionSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.savingsContribution)

  const goal =
    (goalsQuery.data ?? []).find((item) => item.id === goalId) ?? null
  const contributions = contributionsQuery.data ?? []
  const money = { ...display, currency: goal?.currency ?? display.currency }
  const accent = ACCENT_FALLBACK_COLOR
  const progress = Math.min(
    100,
    Math.max(0, amountRatioPct(goal?.currentAmount, goal?.targetAmount) ?? 0)
  )
  const remaining = goal
    ? (parseFinanceMoney(goal.targetAmount) ?? 0) -
      (parseFinanceMoney(goal.currentAmount) ?? 0)
    : null

  const headerActions = useMemo(
    () => (
      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        aria-label="Opciones de la meta"
        onClick={() => setOpenGoalSheet(true)}
      >
        <MoreVerticalIcon className="size-4.5" />
      </Button>
    ),
    [setOpenGoalSheet]
  )

  usePageHeader(
    {
      variant: "secondary",
      title: goal?.name ?? "Meta",
      onBack: () => router.back(),
      actions: headerActions,
      accentColor: accent,
    },
    [router, goal?.name, accent, headerActions]
  )

  async function removeContribution(contributionId: string) {
    if (!goal) {
      return
    }
    const confirmed = window.confirm(
      "¿Borrar este aporte? El saldo de la meta baja."
    )
    if (!confirmed) {
      return
    }
    try {
      await deleteContribution.mutateAsync({ goalId: goal.id, contributionId })
      appToast.success({ text1: "Aporte borrado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  if (goalsQuery.isPending && !goal) {
    return <LoadingView />
  }

  if (!goal) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PiggyBankIcon />
          </EmptyMedia>
          <EmptyTitle>No encontramos esta meta</EmptyTitle>
          <EmptyDescription>
            Puede que se haya borrado o que ya esté completada.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            onClick={() => router.push(APP_ROUTES.app.financePlanning)}
          >
            Volver a Planificación
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <>
      {goalsQuery.error ? (
        <div className="mb-3">
          <FinanceErrorState
            message={financeLoadErrorMessage(goalsQuery.error)}
            onRetry={() => void goalsQuery.refetch()}
            isRetrying={goalsQuery.isFetching}
          />
        </div>
      ) : null}

      <div className="-mx-4 -mt-4 overflow-hidden md:-mx-6">
        <div
          className="rounded-b-3xl p-4 text-white md:p-6"
          style={{ background: accent }}
        >
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20">
              <PiggyBankIcon className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {goal.name}
                </h1>
                <Badge
                  variant={goal.isCompleted ? "success" : "info"}
                  className="shrink-0"
                >
                  {goal.isCompleted ? "Completada" : "En curso"}
                </Badge>
              </div>
              {goal.description ? (
                <p className="mt-1 truncate text-sm text-white/70">
                  {goal.description}
                </p>
              ) : null}
            </div>
          </div>

          <p className="mt-8 text-[11px] tracking-wide text-white/60 uppercase">
            Ahorrado
          </p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {formatFinanceMoney(goal.currentAmount, money)}
          </p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-x-3 text-xs text-white/70">
            <span>{Math.round(progress)}% de la meta</span>
            <span>Meta {formatFinanceMoney(goal.targetAmount, money)}</span>
          </div>
          {remaining !== null && remaining > 0 ? (
            <p className="mt-3 text-sm text-white/80">
              Faltan {formatFinanceMoney(remaining, money)}
              {goal.targetDate
                ? ` · meta al ${formatPlanningDate(goal.targetDate)}`
                : ""}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Aportes</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOpenContributionSheet(true)}
          >
            <PlusIcon className="size-4" />
            Aporte
          </Button>
        </div>

        {contributionsQuery.isError ? (
          <FinanceErrorState
            message={financeLoadErrorMessage(contributionsQuery.error)}
            onRetry={() => void contributionsQuery.refetch()}
            isRetrying={contributionsQuery.isFetching}
          />
        ) : null}

        {contributionsQuery.isPending ? <FinanceListSkeleton rows={4} /> : null}

        {!contributionsQuery.isPending && contributions.length === 0 ? (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PiggyBankIcon />
              </EmptyMedia>
              <EmptyTitle>Sin aportes</EmptyTitle>
              <EmptyDescription>
                Registra el primero para que el avance deje de ser un número
                escrito a mano.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setOpenContributionSheet(true)}>
                <PlusIcon />
                Aporte
              </Button>
            </EmptyContent>
          </Empty>
        ) : null}

        {contributions.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card">
            {contributions.map((contribution, index) => (
              <SummaryItem
                key={contribution.id}
                title={formatFinanceMoney(contribution.amount, money)}
                description={[
                  formatPlanningDate(contribution.contributedAt),
                  contribution.notes ?? "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
                trailing={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Borrar aporte"
                    disabled={deleteContribution.isPending}
                    onClick={() => void removeContribution(contribution.id)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                }
                isLast={index === contributions.length - 1}
              />
            ))}
          </div>
        ) : null}
      </div>

      <SavingsGoalContributionSheet
        open={openContributionSheet}
        onOpenChange={setOpenContributionSheet}
        goalId={goal.id}
        goalName={goal.name}
      />

      <SavingsGoalSheet
        open={openGoalSheet}
        onOpenChange={setOpenGoalSheet}
        goal={goal}
        defaultCurrency={display.currency}
        pending={goalsQuery.isFetching}
      />
    </>
  )
}
