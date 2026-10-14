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
import { SubscriptionSheet } from "@/src/modules/finance/subscriptions/components/subscription-sheet"
import {
  billingCycleLabel,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
} from "@/src/modules/finance/subscriptions/lib/subscription-display"
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
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ExternalLinkIcon,
  HandCoinsIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  ReceiptIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
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
  const { isEnabled, config } = useFinanceEnabled()
  const [editOpen, setEditOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const subscriptionQuery = useSubscription(isEnabled, subscriptionId)
  const paymentsQuery = useSubscriptionPayments(isEnabled, subscriptionId)
  const pauseMutation = usePauseSubscription()
  const resumeMutation = useResumeSubscription()
  const cancelMutation = useCancelSubscription()
  const subscription = subscriptionQuery.data ?? null
  const payments = infiniteListItems(paymentsQuery.data)
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

        <SummarySection title="Cobro" icon={WalletIcon}>
          <SummaryItem
            title="Monto"
            value={formatFinanceMoney(subscription.amount, money)}
          />
          <SummaryItem
            title="Costo mensual"
            value={formatFinanceMoney(subscription.monthlyEquivalent, money)}
          />
          <SummaryItem
            title="Costo anual"
            value={formatFinanceMoney(subscription.annualEquivalent, money)}
          />
          <SummaryItem
            title="Próximo cobro"
            description={formatPlanningDate(subscription.nextBillingDate)}
            value={nextChargeLabel(subscription.daysUntil)}
            isLast
          />
        </SummarySection>

        <SummarySection title="Detalles" icon={ReceiptIcon} collapsible>
          {subscription.cardName || subscription.accountName ? (
            <SummaryItem
              title="Cobro"
              value={subscription.cardName ?? subscription.accountName}
            />
          ) : null}
          {subscription.trialEndsAt ? (
            <SummaryItem
              title="Fin de la prueba"
              value={formatPlanningDate(subscription.trialEndsAt)}
            />
          ) : null}
          <SummaryItem
            title="Recordatorio"
            description="Días antes de la renovación"
            value={String(subscription.reminderDaysBefore)}
          />
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

        <SummarySection
          title="Historial de pagos"
          icon={HandCoinsIcon}
          right={
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={subscription.status === "CANCELLED"}
              onClick={() => setPaymentOpen(true)}
            >
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
                    Los cobros que coincidan se registran solos; también puedes
                    añadirlos a mano.
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
                    ? APP_ROUTES.app.financeTransaction(payment.transaction.id)
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
      </div>

      <SubscriptionSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        subscription={subscription}
        display={display}
        defaultReminderDays={config.subscriptions.reminderDaysBefore}
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
