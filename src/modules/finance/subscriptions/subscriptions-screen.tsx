"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { RecurringSheet } from "@/src/modules/finance/subscriptions/components/recurring-sheet"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useRecurring,
  useUpdateRecurring,
} from "@/src/modules/finance/shared/hooks/use-recurring"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import {
  nextChargeLabel,
  RECURRING_KIND_LABEL,
  recurringFrequencyLabel,
} from "@/src/modules/finance/subscriptions/lib/recurring-display"
import type {
  FinanceRecurringPattern,
  FinanceRecurringStatus,
} from "@/src/modules/finance/shared/types/entities"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn } from "@/src/shared/lib/utils"
import {
  CheckIcon,
  PencilIcon,
  PlusIcon,
  RepeatIcon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

const TAB_ITEMS: {
  value: FinanceRecurringStatus
  label: string
  icon: typeof RepeatIcon
  color: string
}[] = [
  {
    value: "SUGGESTED",
    label: "Por confirmar",
    icon: RepeatIcon,
    color: "#f59e0b",
  },
  {
    value: "CONFIRMED",
    label: "Confirmados",
    icon: CheckIcon,
    color: "#16a34a",
  },
  {
    value: "DISMISSED",
    label: "Descartados",
    icon: XIcon,
    color: "#64748b",
  },
]

function isRecurringTab(value: unknown): value is FinanceRecurringStatus {
  return TAB_ITEMS.some((tab) => tab.value === value)
}

export function SubscriptionsScreen() {
  return (
    <FinanceGate>
      <SubscriptionsScreenBody />
    </FinanceGate>
  )
}

function SubscriptionsScreenBody() {
  const { isEnabled, config } = useFinanceEnabled()
  const [tab, setTab] = useState<FinanceRecurringStatus>("SUGGESTED")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceRecurringPattern | null>(null)
  const [dismissing, setDismissing] =
    useState<FinanceRecurringPattern | null>(null)
  const updateMutation = useUpdateRecurring()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const listQuery = useRecurring(isEnabled, tab)
  const items = infiniteListItems(listQuery.data)
  const monthlyTotal = useMemo(
    () =>
      items.reduce(
        (total, pattern) =>
          total + (parseFinanceMoney(pattern.monthlyEquivalent) ?? 0),
        0
      ),
    [items]
  )

  async function changeStatus(
    pattern: FinanceRecurringPattern,
    status: FinanceRecurringStatus
  ) {
    try {
      await updateMutation.mutateAsync({ id: pattern.id, body: { status } })
      appToast.success({
        text1: status === "CONFIRMED" ? "Recurrente confirmado" : "Descartado",
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        onClick={() => {
          setEditing(null)
          setSheetOpen(true)
        }}
      >
        <PlusIcon className="size-4 shrink-0" />
        Nuevo recurrente
      </Button>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (isRecurringTab(value)) {
            setTab(value)
          }
        }}
      >
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-2xl p-1">
          {TAB_ITEMS.map(({ value, label, icon: Icon, color }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-xl py-2"
              style={
                tab === value
                  ? { color, backgroundColor: `${color}1a` }
                  : undefined
              }
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_ITEMS.map(({ value }) => (
          <TabsContent key={value} value={value} keepMounted>
            {listQuery.isError ? (
              <FinanceErrorState
                message={financeErrorMessage(listQuery.error)}
                onRetry={() => void listQuery.refetch()}
                isRetrying={listQuery.isFetching}
              />
            ) : null}

            <AsyncRegion
              pending={listQuery.isPending && !listQuery.data}
              pendingFallback={<FinanceListSkeleton />}
              empty={items.length === 0}
              emptyFallback={
                <Empty className="py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <RepeatIcon />
                    </EmptyMedia>
                    <EmptyTitle>
                      {value === "SUGGESTED"
                        ? "Sin cobros por confirmar"
                        : value === "CONFIRMED"
                          ? "Sin recurrentes confirmados"
                          : "Sin descartados"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {value === "CONFIRMED"
                        ? "Confirma un cobro detectado o crea uno a mano."
                        : "Cuando detectemos cobros repetidos aparecerán aquí."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              }
            >
              <div className="flex flex-col gap-3">
                {value === "CONFIRMED" &&
                items.length > 0 &&
                !listQuery.hasNextPage ? (
                  <p className="text-sm text-muted-foreground">
                    Costo mensual estimado:{" "}
                    <span className="font-medium text-foreground">
                      {formatFinanceMoney(monthlyTotal, display)}
                    </span>
                  </p>
                ) : null}
                {items.map((pattern) => (
                  <RecurringCard
                    key={pattern.id}
                    pattern={pattern}
                    display={display}
                    isPending={updateMutation.isPending}
                    onConfirm={() => void changeStatus(pattern, "CONFIRMED")}
                    onDismiss={() => setDismissing(pattern)}
                    onEdit={() => {
                      setEditing(pattern)
                      setSheetOpen(true)
                    }}
                  />
                ))}
              </div>
            </AsyncRegion>
            <InfiniteListSentinel
              hasNextPage={listQuery.hasNextPage}
              isFetchingNextPage={listQuery.isFetchingNextPage}
              onLoadMore={() => void listQuery.fetchNextPage()}
            />
          </TabsContent>
        ))}
      </Tabs>

      <RecurringSheet
        open={sheetOpen}
        onOpenChange={(next) => {
          setSheetOpen(next)
          if (!next) {
            setEditing(null)
          }
        }}
        pattern={editing}
        defaultCurrency={config.baseCurrency}
      />

      <AlertDialog
        open={dismissing !== null}
        onOpenChange={(open) => !open && setDismissing(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Descartar {dismissing?.merchantName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              No se volverá a sugerir. Puedes confirmarlo más tarde desde
              Descartados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={updateMutation.isPending}
              onClick={() => {
                if (dismissing) {
                  void changeStatus(dismissing, "DISMISSED")
                }
                setDismissing(null)
              }}
            >
              {updateMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

type RecurringCardProps = {
  pattern: FinanceRecurringPattern
  display: {
    currency: string
    showCents: boolean
    compactNumbers: boolean
  }
  isPending: boolean
  onConfirm: () => void
  onDismiss: () => void
  onEdit: () => void
}

function RecurringCard({
  pattern,
  display,
  isPending,
  onConfirm,
  onDismiss,
  onEdit,
}: RecurringCardProps) {
  const late = pattern.daysUntil < 0
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <BrandLogo
          name={pattern.merchantName}
          logoUrl={pattern.logoUrl}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{pattern.merchantName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {RECURRING_KIND_LABEL[pattern.kind]} ·{" "}
            {recurringFrequencyLabel(pattern.frequency)}
          </p>
        </div>
        <Badge variant={late ? "warning" : "info"}>
          {nextChargeLabel(pattern.daysUntil)}
        </Badge>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">
            {formatFinanceMoney(pattern.avgAmount, {
              ...display,
              currency: pattern.currency,
            })}
          </p>
          <p
            className={cn(
              "text-xs text-muted-foreground",
              late && "text-amber-600"
            )}
          >
            Próximo: {pattern.nextExpectedDate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Costo mensual</p>
          <p className="text-sm font-medium">
            {formatFinanceMoney(pattern.monthlyEquivalent, {
              ...display,
              currency: pattern.currency,
            })}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Costo anual</p>
          <p className="text-sm font-medium">
            {formatFinanceMoney(pattern.annualEquivalent, {
              ...display,
              currency: pattern.currency,
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {pattern.status !== "CONFIRMED" ? (
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={onConfirm}
          >
            <RotateCcwIcon className="size-4 shrink-0" />
            Confirmar
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={onEdit}
        >
          <PencilIcon className="size-4 shrink-0" />
          Editar
        </Button>
        {pattern.status !== "DISMISSED" ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={onDismiss}
          >
            <XIcon className="size-4 shrink-0" />
            Descartar
          </Button>
        ) : null}
      </div>
    </div>
  )
}
