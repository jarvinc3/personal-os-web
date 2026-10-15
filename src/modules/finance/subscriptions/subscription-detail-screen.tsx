"use client"

import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useCancelSubscription,
  usePauseSubscription,
  useResumeSubscription,
  useSubscription,
  useSubscriptionPayments,
} from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { SubscriptionPaymentSheet } from "@/src/modules/finance/subscriptions/components/subscription-payment-sheet"
import { SubscriptionPriceChart } from "@/src/modules/finance/subscriptions/components/subscription-price-chart"
import { SubscriptionSheet } from "@/src/modules/finance/subscriptions/components/subscription-sheet"
import {
  billingCycleLabel,
  SUBSCRIPTION_DETAIL_TAB_PARAM,
  SUBSCRIPTION_DETAIL_TABS,
  subscriptionDetailTabFromParam,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
  withSubscriptionDetailTab,
  type SubscriptionDetailTab,
} from "@/src/modules/finance/subscriptions/lib/subscription-display"
import {
  priceChangeOverMonths,
  subscriptionPriceHistory,
} from "@/src/modules/finance/subscriptions/lib/subscription-price"
import {
  billingMonthLabel,
  shortBillingDate,
  subscriptionCycleProgress,
} from "@/src/modules/finance/subscriptions/lib/subscription-timing"
import { nextChargeLabel } from "@/src/modules/finance/subscriptions/lib/recurring-display"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { formatPlanningDate } from "@/src/modules/finance/shared/lib/planning-lists"
import type { FinanceSubscriptionPaymentSource } from "@/src/modules/finance/shared/types/entities"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
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
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  BanknoteArrowDownIcon,
  ExternalLinkIcon,
  HandCoinsIcon,
  LineChartIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  ReceiptIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

const PAYMENT_SOURCE_LABEL: Record<FinanceSubscriptionPaymentSource, string> = {
  AUTO: "Automático",
  MANUAL: "Manual",
}

export function SubscriptionDetailScreen({
  subscriptionId,
}: {
  subscriptionId: string
}) {
  return (
    <FinanceGate>
      <SubscriptionDetailBody subscriptionId={subscriptionId} />
    </FinanceGate>
  )
}

function SubscriptionDetailBody({
  subscriptionId,
}: {
  subscriptionId: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isEnabled, config } = useFinanceEnabled()
  const [editOpen, setEditOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const tab = subscriptionDetailTabFromParam(
    searchParams.get(SUBSCRIPTION_DETAIL_TAB_PARAM)
  )
  const [today] = useState(() => new Date())
  const subscriptionQuery = useSubscription(isEnabled, subscriptionId)
  const paymentsQuery = useSubscriptionPayments(isEnabled, subscriptionId)
  const pauseMutation = usePauseSubscription()
  const resumeMutation = useResumeSubscription()
  const cancelMutation = useCancelSubscription()
  const subscription = subscriptionQuery.data ?? null
  const payments = infiniteListItems(paymentsQuery.data)
  const priceHistory = useMemo(
    () => subscriptionPriceHistory(payments),
    [payments]
  )
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const headerActions = useMemo(
    () => (
      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        aria-label="Editar suscripción"
        disabled={!subscription}
        onClick={() => setEditOpen(true)}
      >
        <PencilIcon className="size-4.5" />
      </Button>
    ),
    [subscription]
  )

  usePageHeader(
    {
      variant: "secondary",
      title: subscription?.name ?? "Suscripción",
      onBack: () => router.back(),
      actions: headerActions,
    },
    [router, subscription?.name, headerActions]
  )

  async function runStatusAction(
    action: () => Promise<unknown>,
    successText: string
  ) {
    try {
      await action()
      appToast.success({ text1: successText })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  const statusPending =
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    cancelMutation.isPending

  if (subscriptionQuery.isPending && !subscription) {
    return <LoadingView />
  }

  if (!subscription) {
    return (
      <MissingRecord
        icon={WalletIcon}
        title="No encontramos esta suscripción"
        description="Puede que se haya cancelado o borrado."
        backHref={APP_ROUTES.app.financeSubscriptions}
        backLabel="Volver a Suscripciones"
      />
    )
  }

  const money = { ...display, currency: subscription.currency }
  const cycle = subscriptionCycleProgress(subscription, today)
  const changeOverYear = priceChangeOverMonths({
    series: priceHistory.series,
    months: 12,
    today,
  })

  return (
    <>
      {subscriptionQuery.error ? (
        <div className="mb-3">
          <FinanceErrorState
            message={financeErrorMessage(subscriptionQuery.error)}
            onRetry={() => void subscriptionQuery.refetch()}
            isRetrying={subscriptionQuery.isFetching}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <BrandLogo
            name={subscription.name}
            logoUrl={subscription.logoUrl}
            size={48}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">
              {subscription.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {billingCycleLabel(
                subscription.billingCycle,
                subscription.billingInterval
              )}
            </p>
          </div>
          <Badge variant={subscriptionStatusVariant(subscription.status)}>
            {subscriptionStatusLabel(subscription.status)}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          <span>
            Ciclo {shortBillingDate(cycle.startDate)} –{" "}
            {shortBillingDate(cycle.endDate)}
          </span>
          <span>Desde {billingMonthLabel(subscription.createdAt)}</span>
        </div>

        <Tabs
          className="flex w-full flex-col gap-4"
          value={tab}
          onValueChange={(value) => {
            const query = withSubscriptionDetailTab(
              searchParams.toString(),
              value as SubscriptionDetailTab
            )
            router.replace(query ? `${pathname}?${query}` : pathname, {
              scroll: false,
            })
          }}
        >
          <TabsList className="w-full rounded-2xl bg-background">
            <TabsTrigger
              value={SUBSCRIPTION_DETAIL_TABS.summary}
              className="rounded-2xl py-4"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value={SUBSCRIPTION_DETAIL_TABS.payments}
              className="rounded-2xl py-4"
            >
              Pagos
            </TabsTrigger>
            <TabsTrigger
              value={SUBSCRIPTION_DETAIL_TABS.price}
              className="rounded-2xl py-4"
            >
              Precio
            </TabsTrigger>
          </TabsList>

          <TabsContent value={SUBSCRIPTION_DETAIL_TABS.summary}>
            <div className="flex flex-col gap-4">
              <SummarySection title="Cobro" icon={WalletIcon}>
                <SummaryItem
                  title="Monto"
                  value={formatFinanceMoney(subscription.amount, money)}
                />
                <SummaryItem
                  title="Costo mensual"
                  value={formatFinanceMoney(
                    subscription.monthlyEquivalent,
                    money
                  )}
                />
                <SummaryItem
                  title="Costo anual"
                  value={formatFinanceMoney(
                    subscription.annualEquivalent,
                    money
                  )}
                />
                <SummaryItem
                  title="Próximo cobro"
                  description={formatPlanningDate(subscription.nextBillingDate)}
                  value={nextChargeLabel(subscription.daysUntil)}
                  isLast
                />
              </SummarySection>

              <SummarySection title="Detalles" icon={ReceiptIcon} collapsible>
                <SummaryItem
                  title="Método de pago"
                  value={
                    subscription.paymentMethod
                      ? `${subscription.paymentMethod.name}${
                          subscription.paymentMethod.last4
                            ? ` ••${subscription.paymentMethod.last4}`
                            : ""
                        }`
                      : "Sin método"
                  }
                />
                <SummaryItem
                  title="Categoría"
                  value={subscription.category?.name ?? "Sin categoría"}
                />
                {subscription.trialEndsAt ? (
                  <SummaryItem
                    title="Fin de la prueba"
                    value={formatPlanningDate(subscription.trialEndsAt)}
                  />
                ) : null}
                {subscription.manageUrl ? (
                  <SummaryItem
                    title="Enlace de gestión"
                    icon={ExternalLinkIcon}
                    href={subscription.manageUrl}
                    showChevron
                  />
                ) : null}
                {subscription.notes ? (
                  <SummaryItem
                    title="Notas"
                    description={subscription.notes}
                    isLast
                  />
                ) : null}
              </SummarySection>
            </div>
          </TabsContent>

          <TabsContent value={SUBSCRIPTION_DETAIL_TABS.payments}>
            <SummarySection
              title="Pagos"
              icon={HandCoinsIcon}
              right={
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={subscription.status === "CANCELLED"}
                  onClick={() => setPaymentOpen(true)}
                >
                  <BanknoteArrowDownIcon className="size-4 shrink-0" />
                  Registrar pago
                </Button>
              }
            >
              {paymentsQuery.isError ? (
                <FinanceErrorState
                  message={financeErrorMessage(paymentsQuery.error)}
                  onRetry={() => void paymentsQuery.refetch()}
                  isRetrying={paymentsQuery.isFetching}
                />
              ) : null}
              <AsyncRegion
                pending={paymentsQuery.isPending && !paymentsQuery.data}
                pendingFallback={<FinanceListSkeleton rows={3} />}
                empty={payments.length === 0}
                emptyFallback={
                  <Empty className="py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HandCoinsIcon />
                      </EmptyMedia>
                      <EmptyTitle>Sin pagos registrados</EmptyTitle>
                      <EmptyDescription>
                        Los cobros que coincidan se registran solos; también
                        puedes añadirlos a mano.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                }
              >
                {payments.map((payment, index) => (
                  <SummaryItem
                    key={payment.id}
                    title={formatFinanceMoney(payment.amount, {
                      ...display,
                      currency: payment.currency,
                    })}
                    description={`${formatPlanningDate(payment.paidAt)} · ${PAYMENT_SOURCE_LABEL[payment.source]}`}
                    href={
                      payment.transaction
                        ? APP_ROUTES.app.financeTransaction(
                            payment.transaction.id
                          )
                        : undefined
                    }
                    showChevron={Boolean(payment.transaction)}
                    isLast={index === payments.length - 1}
                  />
                ))}
              </AsyncRegion>
              <InfiniteListSentinel
                hasNextPage={paymentsQuery.hasNextPage}
                isFetchingNextPage={paymentsQuery.isFetchingNextPage}
                onLoadMore={() => void paymentsQuery.fetchNextPage()}
              />
            </SummarySection>
          </TabsContent>

          <TabsContent value={SUBSCRIPTION_DETAIL_TABS.price}>
            <SummarySection
              title="Precio"
              icon={LineChartIcon}
              right={
                changeOverYear === null ? null : (
                  <Badge variant={changeOverYear > 0 ? "danger" : "success"}>
                    {changeOverYear > 0 ? "+" : ""}
                    {changeOverYear}% en 12 meses
                  </Badge>
                )
              }
            >
              {paymentsQuery.isError ? (
                <FinanceErrorState
                  message={financeErrorMessage(paymentsQuery.error)}
                  onRetry={() => void paymentsQuery.refetch()}
                  isRetrying={paymentsQuery.isFetching}
                />
              ) : null}
              <AsyncRegion
                pending={paymentsQuery.isPending && !paymentsQuery.data}
                pendingFallback={<FinanceListSkeleton rows={3} />}
                empty={priceHistory.series.length === 0}
                emptyFallback={
                  <Empty className="py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <LineChartIcon />
                      </EmptyMedia>
                      <EmptyTitle>Sin historial de precio</EmptyTitle>
                      <EmptyDescription>
                        Cuando se registren cobros, aquí verás cómo cambió el
                        monto.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                }
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-2xl font-bold tabular-nums">
                    {formatFinanceMoney(subscription.amount, money)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {billingCycleLabel(
                      subscription.billingCycle,
                      subscription.billingInterval
                    ).toLowerCase()}
                  </span>
                </div>
                <SubscriptionPriceChart
                  series={priceHistory.series}
                  display={money}
                />
                <div className="flex flex-col">
                  {priceHistory.changes.map((change, index) => (
                    <SummaryItem
                      key={change.date}
                      title={formatPlanningDate(change.date)}
                      description={
                        change.previousAmount === null
                          ? "Inicio"
                          : `Detectado en el cobro${
                              change.percent === null
                                ? ""
                                : ` · ${change.percent > 0 ? "+" : ""}${change.percent}%`
                            }`
                      }
                      value={
                        change.previousAmount === null
                          ? formatFinanceMoney(change.amount, money)
                          : `${formatFinanceMoney(change.previousAmount, money)} → ${formatFinanceMoney(change.amount, money)}`
                      }
                      isLast={index === priceHistory.changes.length - 1}
                    />
                  ))}
                </div>
              </AsyncRegion>
            </SummarySection>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          {subscription.status === "ACTIVE" ? (
            <Button
              type="button"
              variant="outline"
              disabled={statusPending}
              onClick={() =>
                void runStatusAction(
                  () => pauseMutation.mutateAsync(subscription.id),
                  "Suscripción pausada"
                )
              }
            >
              {pauseMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PauseIcon className="size-4 shrink-0" />
              )}
              Pausar
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={statusPending}
              onClick={() =>
                void runStatusAction(
                  () => resumeMutation.mutateAsync(subscription.id),
                  "Suscripción reanudada"
                )
              }
            >
              {resumeMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PlayIcon className="size-4 shrink-0" />
              )}
              {subscription.status === "PAUSED" ? "Reanudar" : "Reactivar"}
            </Button>
          )}
          {subscription.status !== "CANCELLED" ? (
            <Button
              type="button"
              variant="destructive"
              disabled={statusPending}
              onClick={() => setCancelOpen(true)}
            >
              <XIcon className="size-4 shrink-0" />
              Cancelar
            </Button>
          ) : null}
        </div>
      </div>

      <SubscriptionSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        subscription={subscription}
        display={display}
      />

      <SubscriptionPaymentSheet
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        subscription={subscription}
      />

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar {subscription.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se conserva el historial de pagos. Puedes reactivarla más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={() => {
                void runStatusAction(
                  () => cancelMutation.mutateAsync(subscription.id),
                  "Suscripción cancelada"
                )
                setCancelOpen(false)
              }}
            >
              {cancelMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              Cancelar suscripción
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
