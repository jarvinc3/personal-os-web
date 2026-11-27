"use client"

import { ErrorState } from "@/src/shared/components/feedback/error-state"
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
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
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
  XIcon,
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Alertas"
          description="Subidas de precio, cobros que no cuadran y avisos de renovación"
          actions={
            <SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.subscriptionAlerts} />
          }
        />
        <SheetBody>
          {query.isError ? (
            <ErrorState
              message={financeErrorMessage(query.error)}
              onRetry={() => void query.refetch()}
              isRetrying={query.isFetching}
            />
          ) : null}
          {query.isPending && !query.data ? (
            <div className="flex flex-col gap-2 px-3 py-2" aria-hidden>
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : null}
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
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cerrar
          </Button>
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
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
