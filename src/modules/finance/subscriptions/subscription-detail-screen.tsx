"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
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
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useTabsBehavior } from "@/src/shared/hooks/use-tabs-behavior"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  CircleAlertIcon,
  CircleSlashIcon,
  PauseIcon,
  PencilIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
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
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [pauseOpen, setPauseOpen] = useState(false)
  const [today] = useState(() => new Date())
  const editSheet = useSheetParam(FINANCE_SHEET_KEYS.subscription)
  const paymentSheet = useSheetParam(FINANCE_SHEET_KEYS.subscriptionPayment)
  const openEditSheet = editSheet.setOpen
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
    locale: formatLocale,
  }
  const windowDays = config.subscriptions.reminderDaysBefore

  const headerActions = useMemo(
    () => (
      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        aria-label="Editar suscripción"
        disabled={!subscription}
        onClick={() => openEditSheet(true, subscription?.id ?? null)}
      >
        <PencilIcon className="size-4.5" />
      </Button>
    ),
    [subscription, openEditSheet]
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

  const tabsBehavior = useTabsBehavior({
    value: tab,
    onValueChange: (value) => selectDetailTab(value as SubscriptionDetailTab),
  })

  if (subscriptionQuery.isPending && !subscription) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    )
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
          <ErrorState
            message={financeErrorMessage(subscriptionQuery.error)}
            onRetry={() => void subscriptionQuery.refetch()}
            isRetrying={subscriptionQuery.isFetching}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <SubscriptionDetailHeader
          subscription={subscription}
          display={display}
          today={today}
          windowDays={windowDays}
        />

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
                onClick={() => editSheet.setOpen(true, subscription.id)}
              >
                Asignar
              </Button>
            </AlertAction>
          </Alert>
        )}

        <Tabs {...tabsBehavior} className="flex w-full flex-col gap-4">
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
              onRegister={() => paymentSheet.setOpen(true)}
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
            pause: () => setPauseOpen(true),
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
        open={editSheet.open}
        onOpenChange={editSheet.setOpen}
        subscription={subscription}
        display={display}
      />

      <SubscriptionPaymentSheet
        open={paymentSheet.open}
        onOpenChange={paymentSheet.setOpen}
        subscription={subscription}
      />

      <AlertDialog
        open={pauseOpen}
        onOpenChange={(open) => {
          if (!pauseMutation.isPending) {
            setPauseOpen(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-muted text-muted-foreground">
              <PauseIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Pausar {subscription.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Mientras esté pausada no se registrarán cobros ni recordatorios.
              Puedes reanudarla cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pauseMutation.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={pauseMutation.isPending}
              onClick={() => {
                void runStatusAction(
                  () => pauseMutation.mutateAsync(subscription.id),
                  "Suscripción pausada"
                )
                setPauseOpen(false)
              }}
            >
              {pauseMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PauseIcon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {pauseMutation.isPending ? "Pausando..." : "Pausar suscripción"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          if (!cancelMutation.isPending) {
            setCancelOpen(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <CircleSlashIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Cancelar {subscription.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se conserva el historial de pagos. Puedes reactivarla más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
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
              ) : (
                <CircleSlashIcon
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
              )}
              {cancelMutation.isPending
                ? "Cancelando..."
                : "Cancelar suscripción"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
