"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceProgressHero } from "@/src/modules/finance/shared/components/layout/progress-hero"
import { SavingsGoalContributionSheet } from "@/src/modules/finance/savings-goals/components/savings-goal-contribution-sheet"
import { SavingsGoalSheet } from "@/src/modules/finance/savings-goals/components/savings-goal-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useDeleteSavingsGoal,
  useRestoreSavingsGoal,
  useDeleteSavingsGoalContribution,
  useSavingsGoalContributions,
  useSavingsGoals,
} from "@/src/modules/finance/shared/hooks/use-savings-goals"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import {
  amountRatioPct,
  formatPlanningDate,
} from "@/src/modules/finance/shared/lib/planning-lists"
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
import { appToast } from "@/src/shared/lib/app-toast"
import {
  MoreVerticalIcon,
  PencilIcon,
  PiggyBankIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { ACCENT_FALLBACK_COLOR } from "@/src/shared/lib/accent-gradient"

type FinanceSavingsGoalDetailProps = {
  goalId: string
}

export function SavingsGoalDetailScreen({
  goalId,
}: FinanceSavingsGoalDetailProps) {
  return (
    <FinanceGate>
      <SavingsGoalDetailScreenBody goalId={goalId} />
    </FinanceGate>
  )
}

function SavingsGoalDetailScreenBody({
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
  const contributions = infiniteListItems(contributionsQuery.data)

  useRegisterChatContext(
    goal
      ? {
          moduleSlug: "finance",
          screen: "savings-goal-detail",
          entityRef: { type: "savings_goal", id: goal.id },
          entityLabel: goal.name,
        }
      : null
  )
  const money = { ...display, currency: goal?.currency ?? display.currency }
  const accent = ACCENT_FALLBACK_COLOR
  const progress = Math.max(
    0,
    amountRatioPct(goal?.currentAmount, goal?.targetAmount) ?? 0
  )
  const remaining = goal
    ? (parseFinanceMoney(goal.targetAmount) ?? 0) -
      (parseFinanceMoney(goal.currentAmount) ?? 0)
    : null
  const surplus = remaining !== null && remaining < 0 ? -remaining : null
  const targetDateCaption = goal?.targetDate
    ? ` · meta al ${formatPlanningDate(goal.targetDate)}`
    : ""
  let footnote: string | undefined
  if (surplus !== null) {
    footnote = `Excedente ${formatFinanceMoney(surplus, money)}${targetDateCaption}`
  } else if (remaining !== null && remaining > 0) {
    footnote = `Faltan ${formatFinanceMoney(remaining, money)}${targetDateCaption}`
  }
  const [pendingContributionId, setPendingContributionId] = useState<
    string | null
  >(null)
  const [contributionMenuId, setContributionMenuId] = useState<string | null>(
    null
  )
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [confirmGoalOpen, setConfirmGoalOpen] = useState(false)

  const headerActions = useMemo(
    () => (
      <>
        <ChatLauncherButton />
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full"
          aria-label="Opciones de la meta"
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
      title: goal?.name ?? "Meta",
      onBack: () => router.back(),
      actions: headerActions,
      accentColor: accent,
    },
    [router, goal?.name, accent, headerActions]
  )

  const deleteGoal = useDeleteSavingsGoal()
  const restoreGoal = useRestoreSavingsGoal()

  const pendingContribution =
    contributions.find((item) => item.id === pendingContributionId) ?? null

  async function onDeleteGoal() {
    if (!goal) {
      return
    }
    try {
      const goalId = goal.id
      await deleteGoal.mutateAsync(goalId)
      setConfirmGoalOpen(false)
      setOptionsOpen(false)
      router.push(APP_ROUTES.app.financePlanning)
      showUndoToast("Meta eliminada", () =>
        restoreGoal.mutate(goalId, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function removeContribution() {
    if (!goal || !pendingContributionId) {
      return
    }
    try {
      await deleteContribution.mutateAsync({
        goalId: goal.id,
        contributionId: pendingContributionId,
      })
      appToast.success({ text1: "Aporte borrado" })
      setPendingContributionId(null)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  if (goalsQuery.isPending && !goal) {
    return <LoadingView />
  }

  if (!goal) {
    return (
      <MissingRecord
        icon={PiggyBankIcon}
        title="No encontramos esta meta"
        description="Puede que se haya borrado o que ya esté completada."
        backHref={APP_ROUTES.app.financePlanning}
        backLabel="Volver a Planificación"
      />
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

      <FinanceProgressHero
        accent={accent}
        media={
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <PiggyBankIcon className="size-6" />
          </span>
        }
        title={goal.name}
        badge={{
          label: goal.isCompleted ? "Completada" : "En curso",
          variant: goal.isCompleted ? "success" : "info",
        }}
        subtitle={goal.description ?? undefined}
        metricLabel="Ahorrado"
        metricValue={formatFinanceMoney(goal.currentAmount, money)}
        progress={progress}
        startCaption={`${Math.round(progress)}% de la meta`}
        endCaption={`Meta ${formatFinanceMoney(goal.targetAmount, money)}`}
        footnote={footnote}
      />

      <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
        <Button
          className="w-full"
          onClick={() => setOpenContributionSheet(true)}
        >
          <PlusIcon />
          Agregar aporte
        </Button>

        {contributionsQuery.isError ? (
          <FinanceErrorState
            message={financeLoadErrorMessage(contributionsQuery.error)}
            onRetry={() => void contributionsQuery.refetch()}
            isRetrying={contributionsQuery.isFetching}
          />
        ) : null}

        <AsyncRegion
          pending={contributionsQuery.isPending}
          pendingFallback={<FinanceListSkeleton rows={4} />}
          empty={!contributionsQuery.isError && contributions.length === 0}
          emptyFallback={
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
            </Empty>
          }
        >
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
                      aria-label="Opciones del aporte"
                      disabled={deleteContribution.isPending}
                      onClick={() => setContributionMenuId(contribution.id)}
                    >
                      <MoreVerticalIcon className="size-4" />
                    </Button>
                  }
                  isLast={index === contributions.length - 1}
                />
              ))}
            </div>
          ) : null}
          <InfiniteListSentinel
            hasNextPage={contributionsQuery.hasNextPage}
            isFetchingNextPage={contributionsQuery.isFetchingNextPage}
            onLoadMore={() => void contributionsQuery.fetchNextPage()}
          />
        </AsyncRegion>
      </div>

      <SavingsGoalContributionSheet
        open={openContributionSheet}
        onOpenChange={setOpenContributionSheet}
        goalId={goal.id}
        goalName={goal.name}
        currency={goal.currency}
        targetAmount={goal.targetAmount}
        currentAmount={goal.currentAmount}
        targetDate={goal.targetDate}
        goalAccountId={goal.accountId}
      />

      <SavingsGoalSheet
        open={openGoalSheet}
        onOpenChange={setOpenGoalSheet}
        goal={goal}
        defaultCurrency={display.currency}
        pending={goalsQuery.isFetching}
      />

      <RecordOptionsSheet
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        description={goal.name}
        options={[
          {
            id: "add-contribution",
            title: "Agregar aporte",
            icon: PlusIcon,
            onPress: () => {
              setOptionsOpen(false)
              setOpenContributionSheet(true)
            },
          },
          {
            id: "edit",
            title: "Editar meta",
            icon: PencilIcon,
            onPress: () => {
              setOptionsOpen(false)
              setOpenGoalSheet(true)
            },
          },
          {
            id: "delete",
            title: "Eliminar",
            icon: Trash2Icon,
            destructive: true,
            disabled: deleteGoal.isPending,
            onPress: () => setConfirmGoalOpen(true),
          },
        ]}
      />

      <RecordOptionsSheet
        open={contributionMenuId !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setContributionMenuId(null)
          }
        }}
        title="Aporte"
        options={[
          {
            id: "delete-contribution",
            title: "Eliminar aporte",
            icon: Trash2Icon,
            destructive: true,
            disabled: deleteContribution.isPending,
            onPress: () => {
              setPendingContributionId(contributionMenuId)
              setContributionMenuId(null)
            },
          },
        ]}
      />

      <DeleteRecordDialog
        open={confirmGoalOpen}
        onOpenChange={setConfirmGoalOpen}
        recordName={goal.name}
        pending={deleteGoal.isPending}
        consequences="Se borran sus aportes. No se puede deshacer."
        onConfirm={() => void onDeleteGoal()}
      />

      <DeleteRecordDialog
        open={pendingContributionId !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPendingContributionId(null)
          }
        }}
        recordName={
          pendingContribution
            ? formatFinanceMoney(pendingContribution.amount, money)
            : "el aporte"
        }
        pending={deleteContribution.isPending}
        consequences="El saldo de la meta baja. No se puede deshacer."
        onConfirm={() => void removeContribution()}
      />
    </>
  )
}
