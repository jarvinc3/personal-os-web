"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import {
  FinanceSegmentedControl,
  FinanceSuggestionRow,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { RecurringSheet } from "@/src/modules/finance/subscriptions/components/recurring-sheet"
import { SubscriptionSheet } from "@/src/modules/finance/subscriptions/components/subscription-sheet"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useRecurring,
  useUpdateRecurring,
} from "@/src/modules/finance/shared/hooks/use-recurring"
import {
  useSubscriptionSummary,
  useSubscriptions,
} from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import {
  billingCycleLabel,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
} from "@/src/modules/finance/subscriptions/lib/subscription-display"
import {
  nextChargeLabel,
  RECURRING_KIND_LABEL,
  recurringFrequencyLabel,
} from "@/src/modules/finance/subscriptions/lib/recurring-display"
import type { SubscriptionDraft } from "@/src/modules/finance/subscriptions/lib/subscription-form"
import type {
  FinanceRecurringPattern,
  FinanceRecurringStatus,
  FinanceSubscriptionStatus,
} from "@/src/modules/finance/shared/types/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
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
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn } from "@/src/shared/lib/utils"
import {
  CalendarClockIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  RepeatIcon,
  RotateCcwIcon,
  SearchIcon,
  SparklesIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

const MANAGED_TAB = "managed"
const RECURRING_TAB = "recurring"
const SECTION_TAB_QUERY = "tab"
const RECURRING_STATUS_QUERY = "recurring"
const SUGGESTION_LIMIT = 3

type SectionTab = typeof MANAGED_TAB | typeof RECURRING_TAB

type StatusFilter = "ALL" | FinanceSubscriptionStatus

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "ACTIVE", label: "Activas" },
  { value: "PAUSED", label: "Pausadas" },
  { value: "CANCELLED", label: "Canceladas" },
]

const RECURRING_TABS: {
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

function isSectionTab(value: unknown): value is SectionTab {
  return value === MANAGED_TAB || value === RECURRING_TAB
}

function isRecurringTab(value: unknown): value is FinanceRecurringStatus {
  return RECURRING_TABS.some((tab) => tab.value === value)
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
  const [section, setSection] = useState<SectionTab>(MANAGED_TAB)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [subscriptionDraft, setSubscriptionDraft] =
    useState<SubscriptionDraft | null>(null)
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  function openCreate(draft: SubscriptionDraft | null = null) {
    setSubscriptionDraft(draft)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <Button type="button" onClick={() => openCreate()}>
        <PlusIcon className="size-4 shrink-0" />
        Nueva suscripción
      </Button>

      <Tabs
        persistKey={SECTION_TAB_QUERY}
        value={section}
        onValueChange={(value) => {
          if (isSectionTab(value)) {
            setSection(value)
          }
        }}
      >
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-2xl p-1">
          <TabsTrigger value={MANAGED_TAB} className="rounded-xl py-2">
            <WalletIcon className="size-4 shrink-0" />
            Suscripciones
          </TabsTrigger>
          <TabsTrigger value={RECURRING_TAB} className="rounded-xl py-2">
            <RepeatIcon className="size-4 shrink-0" />
            Recurrentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value={MANAGED_TAB} keepMounted>
          <ManagedSubscriptions
            isEnabled={isEnabled}
            display={display}
            onCreateFromPattern={(pattern) =>
              openCreate({
                name: pattern.merchantName,
                amount: pattern.avgAmount,
                currency: pattern.currency,
                sourcePatternId: pattern.id,
              })
            }
          />
        </TabsContent>

        <TabsContent value={RECURRING_TAB} keepMounted>
          <RecurringPatterns isEnabled={isEnabled} display={display} />
        </TabsContent>
      </Tabs>

      <SubscriptionSheet
        open={sheetOpen}
        onOpenChange={(next) => {
          setSheetOpen(next)
          if (!next) {
            setSubscriptionDraft(null)
          }
        }}
        subscription={null}
        draft={subscriptionDraft ?? undefined}
        display={display}
        defaultReminderDays={config.subscriptions.reminderDaysBefore}
      />
    </div>
  )
}

type ManagedSubscriptionsProps = {
  isEnabled: boolean
  display: {
    currency: string
    showCents: boolean
    compactNumbers: boolean
  }
  onCreateFromPattern: (pattern: FinanceRecurringPattern) => void
}

function ManagedSubscriptions({
  isEnabled,
  display,
  onCreateFromPattern,
}: ManagedSubscriptionsProps) {
  const [status, setStatus] = useState<StatusFilter>("ALL")
  const [currency, setCurrency] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const summaryQuery = useSubscriptionSummary(isEnabled)
  const suggestionsQuery = useRecurring(isEnabled, "SUGGESTED")
  const listQuery = useSubscriptions(isEnabled, {
    status: status === "ALL" ? undefined : status,
    currency: currency === "ALL" ? undefined : currency,
    q: search.trim() || undefined,
  })
  const items = infiniteListItems(listQuery.data)
  const suggestions = infiniteListItems(suggestionsQuery.data).slice(
    0,
    SUGGESTION_LIMIT
  )
  const summary = summaryQuery.data
  const currencyOptions = useMemo(() => {
    const codes = new Set<string>([display.currency])
    for (const item of items) {
      codes.add(item.currency)
    }
    return [
      { value: "ALL", label: "Todas" },
      ...[...codes].map((code) => ({ value: code, label: code })),
    ]
  }, [items, display.currency])

  return (
    <div className="flex flex-col gap-4">
      {summaryQuery.isError ? (
        <FinanceErrorState
          message={financeErrorMessage(summaryQuery.error)}
          onRetry={() => void summaryQuery.refetch()}
          isRetrying={summaryQuery.isFetching}
        />
      ) : null}

      {summary ? (
        <SummarySection title="Resumen" icon={WalletIcon}>
          <SummaryItem
            title="Costo mensual"
            description={`${summary.activeCount} activa${summary.activeCount === 1 ? "" : "s"}`}
            value={formatFinanceMoney(summary.monthlyCost, display)}
          />
          <SummaryItem
            title="Costo anual"
            value={formatFinanceMoney(summary.annualCost, display)}
          />
          <SummaryItem
            title="Próximos cobros (7 días)"
            icon={CalendarClockIcon}
            description={
              summary.upcoming.length === 0
                ? "Nada en la próxima semana"
                : summary.upcoming
                    .map((item) => item.name)
                    .slice(0, 3)
                    .join(", ")
            }
            value={String(summary.upcoming.length)}
            isLast
          />
        </SummarySection>
      ) : null}

      {suggestions.length > 0 ? (
        <SummarySection
          title="Detectamos cobros recurrentes"
          icon={SparklesIcon}
        >
          {suggestions.map((pattern) => (
            <FinanceSuggestionRow
              key={pattern.id}
              actionLabel="Es una suscripción"
              onAction={() => onCreateFromPattern(pattern)}
            >
              {pattern.merchantName} cobra{" "}
              {formatFinanceMoney(pattern.avgAmount, {
                ...display,
                currency: pattern.currency,
              })}{" "}
              {recurringFrequencyLabel(pattern.frequency).toLowerCase()}
            </FinanceSuggestionRow>
          ))}
        </SummarySection>
      ) : null}

      <FinanceSegmentedControl
        label="Estado"
        value={status}
        onChange={setStatus}
        options={STATUS_FILTER_OPTIONS}
        fullWidth
      />

      {currencyOptions.length > 2 ? (
        <FinanceSegmentedControl
          label="Moneda"
          value={currency}
          onChange={setCurrency}
          options={currencyOptions}
          fullWidth
        />
      ) : null}

      <FormTextField
        label="Buscar"
        icon={SearchIcon}
        value={search}
        onChange={setSearch}
        placeholder="Netflix, Spotify…"
      />

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
                <WalletIcon />
              </EmptyMedia>
              <EmptyTitle>Sin suscripciones</EmptyTitle>
              <EmptyDescription>
                Crea una a mano o conviértela desde un cobro recurrente
                detectado.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        <div className="rounded-2xl border border-border bg-card">
          {items.map((subscription, index) => (
            <SummaryItem
              key={subscription.id}
              title={subscription.name}
              description={`${billingCycleLabel(subscription.billingCycle, subscription.billingInterval)} · ${nextChargeLabel(subscription.daysUntil)}`}
              leading={
                <BrandLogo
                  name={subscription.name}
                  logoUrl={subscription.logoUrl}
                  size={36}
                />
              }
              value={formatFinanceMoney(subscription.amount, {
                ...display,
                currency: subscription.currency,
              })}
              trailing={
                <Badge variant={subscriptionStatusVariant(subscription.status)}>
                  {subscriptionStatusLabel(subscription.status)}
                </Badge>
              }
              href={APP_ROUTES.app.financeSubscription(subscription.id)}
              isLast={index === items.length - 1}
            />
          ))}
        </div>
      </AsyncRegion>

      <InfiniteListSentinel
        hasNextPage={listQuery.hasNextPage}
        isFetchingNextPage={listQuery.isFetchingNextPage}
        onLoadMore={() => void listQuery.fetchNextPage()}
      />
    </div>
  )
}

type RecurringPatternsProps = {
  isEnabled: boolean
  display: {
    currency: string
    showCents: boolean
    compactNumbers: boolean
  }
}

function RecurringPatterns({ isEnabled, display }: RecurringPatternsProps) {
  const [tab, setTab] = useState<FinanceRecurringStatus>("SUGGESTED")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceRecurringPattern | null>(null)
  const [dismissing, setDismissing] = useState<FinanceRecurringPattern | null>(
    null
  )
  const updateMutation = useUpdateRecurring()
  const listQuery = useRecurring(isEnabled, tab)
  const items = infiniteListItems(listQuery.data)

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
      <Tabs
        persistKey={RECURRING_STATUS_QUERY}
        value={tab}
        onValueChange={(value) => {
          if (isRecurringTab(value)) {
            setTab(value)
          }
        }}
      >
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-2xl p-1">
          {RECURRING_TABS.map(({ value, label, icon: Icon, color }) => (
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

        {RECURRING_TABS.map(({ value }) => (
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
        defaultCurrency={display.currency}
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
