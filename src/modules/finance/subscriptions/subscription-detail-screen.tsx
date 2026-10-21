"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useCancelSubscription,
  usePauseSubscription,
  useResumeSubscription,
  useSubscription,
} from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { SubscriptionDetailHeader } from "@/src/modules/finance/subscriptions/components/subscription-detail-header"
import { SubscriptionPaymentSheet } from "@/src/modules/finance/subscriptions/components/subscription-payment-sheet"
import { SubscriptionPaymentsTab } from "@/src/modules/finance/subscriptions/components/subscription-payments-tab"
import { SubscriptionPriceTab } from "@/src/modules/finance/subscriptions/components/subscription-price-tab"
import { SubscriptionSheet } from "@/src/modules/finance/subscriptions/components/subscription-sheet"
import { SubscriptionStatusActions } from "@/src/modules/finance/subscriptions/components/subscription-status-actions"
import { SubscriptionSummaryTab } from "@/src/modules/finance/subscriptions/components/subscription-summary-tab"
import {
  SUBSCRIPTION_DETAIL_TAB_PARAM,
  SUBSCRIPTION_DETAIL_TABS,
  subscriptionDetailTabFromParam,
  withSubscriptionDetailTab,
  type SubscriptionDetailTab,
} from "@/src/modules/finance/subscriptions/lib/subscription-display"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
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
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { appToast } from "@/src/shared/lib/app-toast"
import { CircleAlertIcon, PencilIcon, WalletIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

type SubscriptionDetailScreenProps = {
  subscriptionId: string
}

export function SubscriptionDetailScreen({
  subscriptionId,
}: SubscriptionDetailScreenProps) {
  return (
    <FinanceGate>
      <SubscriptionDetailBody subscriptionId={subscriptionId} />
    </FinanceGate>
  )
}

function SubscriptionDetailBody({
  subscriptionId,
}: SubscriptionDetailScreenProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isEnabled, config } = useFinanceEnabled()
  const [editOpen, setEditOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [today] = useState(() => new Date())
  const tab = subscriptionDetailTabFromParam(
    searchParams.get(SUBSCRIPTION_DETAIL_TAB_PARAM)
  )
  const subscriptionQuery = useSubscription(isEnabled, subscriptionId)
  const pauseMutation = usePauseSubscription()
  const resumeMutation = useResumeSubscription()
  const cancelMutation = useCancelSubscription()
  const subscription = subscriptionQuery.data ?? null
  const display: FinanceMoneyDisplay = {
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

  function selectDetailTab(next: SubscriptionDetailTab) {
    const query = withSubscriptionDetailTab(searchParams.toString(), next)
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

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
        <SubscriptionDetailHeader subscription={subscription} today={today} />

        {subscription.paymentMethod ? null : (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Sin método de pago</AlertTitle>
            <AlertDescription>
              Los pagos de esta suscripción no afectan ningún saldo.
            </AlertDescription>
            <AlertAction>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditOpen(true)}
              >
                Asignar
              </Button>
            </AlertAction>
          </Alert>
        )}

        <Tabs
          className="flex w-full flex-col gap-4"
          value={tab}
          onValueChange={(value) =>
            selectDetailTab(value as SubscriptionDetailTab)
          }
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
            <SubscriptionSummaryTab subscription={subscription} money={money} />
          </TabsContent>

          <TabsContent value={SUBSCRIPTION_DETAIL_TABS.payments}>
            <SubscriptionPaymentsTab
              subscriptionId={subscription.id}
              enabled={isEnabled}
              display={display}
              canRegister={subscription.status !== "CANCELLED"}
              onRegister={() => setPaymentOpen(true)}
            />
          </TabsContent>

          <TabsContent value={SUBSCRIPTION_DETAIL_TABS.price}>
            <SubscriptionPriceTab
              subscription={subscription}
              subscriptionId={subscription.id}
              enabled={isEnabled}
              money={money}
              today={today}
            />
          </TabsContent>
        </Tabs>

        <SubscriptionStatusActions
          subscription={subscription}
          pending={{
            pause: pauseMutation.isPending,
            resume: resumeMutation.isPending,
          }}
          actions={{
            pause: () =>
              void runStatusAction(
                () => pauseMutation.mutateAsync(subscription.id),
                "Suscripción pausada"
              ),
            resume: () =>
              void runStatusAction(
                () => resumeMutation.mutateAsync(subscription.id),
                "Suscripción reanudada"
              ),
            cancel: () => setCancelOpen(true),
          }}
        />
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
