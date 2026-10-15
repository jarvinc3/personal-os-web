"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import {
  useDismissAllSubscriptionAlerts,
  useSubscriptionAlerts,
} from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  subscriptionAlertReviewTarget,
  subscriptionAlertView,
} from "@/src/modules/finance/subscriptions/lib/subscription-display"
import type { FinanceSubscriptionAlert } from "@/src/modules/finance/shared/types/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  BellOffIcon,
  CheckCheckIcon,
  ChevronRightIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"

type AlertsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEnabled: boolean
  display: FinanceMoneyDisplay
}

/** Price and charge alerts, with a per-alert review and a dismiss-all. */
export function AlertsSheet({
  open,
  onOpenChange,
  isEnabled,
  display,
}: AlertsSheetProps) {
  const query = useSubscriptionAlerts(isEnabled && open)
  const dismissAll = useDismissAllSubscriptionAlerts()
  const alerts = query.data ?? []

  async function markAllSeen() {
    try {
      const dismissal = await dismissAll.mutateAsync()
      appToast.success({
        text1:
          dismissal.dismissed === 1
            ? "1 alerta marcada como vista"
            : `${dismissal.dismissed} alertas marcadas como vistas`,
      })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Alertas"
      description="Subidas de precio y cobros que no cuadran"
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cerrar
          </Button>
        ),
        submit: (
          <Button
            className="flex-1"
            disabled={alerts.length === 0 || dismissAll.isPending}
            onClick={() => void markAllSeen()}
          >
            {dismissAll.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <CheckCheckIcon className="size-4 shrink-0" />
            )}
            Marcar vistas
          </Button>
        ),
      }}
    >
      {query.isError ? (
        <FinanceErrorState
          message={financeErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : null}
      {query.isPending && !query.data ? <FinanceListSkeleton rows={3} /> : null}
      {!query.isPending && alerts.length === 0 ? (
        <Empty className="py-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BellOffIcon />
            </EmptyMedia>
            <EmptyTitle>Sin alertas</EmptyTitle>
            <EmptyDescription>
              Los precios y los cobros de tus suscripciones están en orden.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
      <div className="flex flex-col gap-2">
        {alerts.map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            display={display}
            onReview={() => onOpenChange(false)}
          />
        ))}
      </div>
    </BottomSheet>
  )
}

type AlertRowProps = {
  alert: FinanceSubscriptionAlert
  display: FinanceMoneyDisplay
  onReview: () => void
}

function AlertRow({ alert, display, onReview }: AlertRowProps) {
  const view = subscriptionAlertView({ alert, display })
  const target = subscriptionAlertReviewTarget(alert.kind)
  return (
    <Link
      href={`${APP_ROUTES.app.financeSubscription(alert.subscriptionId)}?tab=${target}`}
      onClick={onReview}
      className="relative flex items-center gap-3 rounded-2xl border border-border p-3"
    >
      <BrandLogo name={alert.subscriptionName} size={32} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{view.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {view.description}
        </p>
      </div>
      {view.badge ? (
        <Badge variant={view.badgeVariant}>{view.badge}</Badge>
      ) : null}
      <span className="flex items-center gap-1 text-xs font-medium text-primary">
        Revisar
        <ChevronRightIcon className="size-3.5" aria-hidden />
      </span>
      <LinkPendingOverlay />
    </Link>
  )
}
