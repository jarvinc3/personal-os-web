"use client"

import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { ListSkeleton } from "@/src/shared/components/feedback/list-skeleton"
import { NoticeCard } from "@/src/modules/finance/shared/components/notice-card"
import type { NoticeTone } from "@/src/modules/finance/shared/components/notice-card"
import {
  useDismissAllSubscriptionAlerts,
  useSubscription,
  useSubscriptionAlerts,
} from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { SubscriptionCard } from "@/src/modules/finance/subscriptions/components/subscription-card"
import {
  subscriptionAlertReviewTarget,
  subscriptionAlertView,
} from "@/src/modules/finance/subscriptions/lib/subscription-display"
import type {
  FinanceSubscriptionAlert,
  FinanceSubscriptionAlertKind,
} from "@/src/modules/finance/shared/types/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
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
  CalendarClockIcon,
  CheckCheckIcon,
  CircleAlertIcon,
  ClockIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

type AlertNotice = {
  icon: LucideIcon
  tone: NoticeTone
}

const ALERT_NOTICE: Record<FinanceSubscriptionAlertKind, AlertNotice> = {
  PRICE_INCREASE: { icon: TrendingUpIcon, tone: "warning" },
  AMOUNT_MISMATCH: { icon: TriangleAlertIcon, tone: "warning" },
  TRIAL_ENDING: { icon: ClockIcon, tone: "info" },
  ANNUAL_RENEWAL: { icon: CalendarClockIcon, tone: "info" },
  MISSED_CHARGE: { icon: CircleAlertIcon, tone: "danger" },
}

type AlertsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEnabled: boolean
  display: FinanceMoneyDisplay
  today: Date
  /** Warning window in days, from the global setting. */
  windowDays: number
}

/** Price and charge alerts, with a per-alert review and a dismiss-all. */
export function AlertsSheet({
  open,
  onOpenChange,
  isEnabled,
  display,
  today,
  windowDays,
}: AlertsSheetProps) {
  const router = useRouter()
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

  function reviewAlert(alert: FinanceSubscriptionAlert) {
    const target = subscriptionAlertReviewTarget(alert.kind)
    onOpenChange(false)
    router.push(
      `${APP_ROUTES.app.financeSubscription(alert.subscriptionId)}?tab=${target}`
    )
  }

  return (
    <BottomSheet
      closeLabel="Cerrar"
      open={open}
      onOpenChange={onOpenChange}
      title="Alertas"
      description="Subidas de precio, cobros que no cuadran y avisos de renovación"
      actions={{
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
        <ErrorState
          message={financeErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : null}
      {query.isPending && !query.data ? <ListSkeleton rows={3} /> : null}
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
          <SubscriptionAlertNotice
            key={alert.id}
            alert={alert}
            display={display}
            today={today}
            windowDays={windowDays}
            isEnabled={isEnabled && open}
            onReview={() => reviewAlert(alert)}
          />
        ))}
      </div>
    </BottomSheet>
  )
}

type SubscriptionAlertNoticeProps = {
  alert: FinanceSubscriptionAlert
  display: FinanceMoneyDisplay
  today: Date
  windowDays: number
  isEnabled: boolean
  onReview: () => void
}

function SubscriptionAlertNotice({
  alert,
  display,
  today,
  windowDays,
  isEnabled,
  onReview,
}: SubscriptionAlertNoticeProps) {
  const subscriptionQuery = useSubscription(isEnabled, alert.subscriptionId)
  const view = subscriptionAlertView({ alert, display })
  const notice = ALERT_NOTICE[alert.kind]
  const subscription = subscriptionQuery.data ?? null

  return (
    <NoticeCard
      icon={notice.icon}
      tone={notice.tone}
      title={view.title}
      description={view.description}
      trailing={
        view.badge ? (
          <Badge variant={view.badgeVariant}>{view.badge}</Badge>
        ) : null
      }
    >
      {subscription ? (
        <SubscriptionCard
          subscription={subscription}
          display={display}
          today={today}
          windowDays={windowDays}
          variant="compact"
          onPress={onReview}
        />
      ) : null}
    </NoticeCard>
  )
}
