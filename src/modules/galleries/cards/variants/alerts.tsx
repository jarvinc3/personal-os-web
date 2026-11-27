import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { SubscriptionCard } from "@/src/modules/finance/subscriptions/components/subscription-card"
import { GALLERY_TODAY } from "@/src/modules/galleries/cards/mock/display"
import {
  galleryBalanceDrift,
  galleryCheckingAccount,
  galleryReconciliationItem,
  galleryWarningSubscription,
} from "@/src/modules/galleries/cards/mock/finance"
import type { GalleryVariant } from "@/src/modules/galleries/cards/variants/types"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import {
  ALERT_SOFT_TONE_CLASS_NAME,
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Badge } from "@/src/shared/components/ui/badge"
import { BellRingIcon, ScaleIcon, TriangleAlertIcon } from "lucide-react"

/** Avisos con la card de su entidad (#272). */
export const alertVariants: readonly GalleryVariant[] = [
  {
    id: "aviso-descuadre",
    label: "Descuadre",
    propLabel: "cuenta compacta + aviso",
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <div className="flex flex-col gap-2">
        <AccountProductRow
          account={galleryCheckingAccount}
          display={display}
          variant="compact"
          onPress={notifyTap}
        />
        <Alert className={ALERT_SOFT_TONE_CLASS_NAME.destructive}>
          <TriangleAlertIcon aria-hidden="true" />
          <AlertTitle>Saldo descuadrado</AlertTitle>
          <AlertDescription>
            {`Guardado ${formatFinanceMoney(galleryBalanceDrift.storedBalance, display)} · Debería ser ${formatFinanceMoney(galleryBalanceDrift.expectedBalance, display)} · Diferencia ${formatFinanceMoney(galleryBalanceDrift.difference, display)}`}
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    id: "aviso-sin-conciliar",
    label: "Sin conciliar",
    propLabel: "cuenta compacta + aviso",
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <div className="flex flex-col gap-2">
        <AccountProductRow
          account={galleryCheckingAccount}
          display={display}
          variant="compact"
          onPress={notifyTap}
        />
        <Alert className={ALERT_SOFT_TONE_CLASS_NAME.warning}>
          <ScaleIcon aria-hidden="true" />
          <AlertTitle>
            {`${galleryReconciliationItem.name} sin conciliar`}
          </AlertTitle>
          <AlertDescription>
            {`Balance ${formatFinanceMoney(galleryReconciliationItem.balance, display)} · Última conciliación 30 sep 2026`}
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    id: "aviso-suscripcion",
    label: "Alerta de suscripción",
    propLabel: "aviso + suscripción compacta",
    height: "≈ 170 px",
    render: ({ display, notifyTap }) => (
      <div className="flex flex-col gap-2">
        <SubscriptionCard
          subscription={galleryWarningSubscription}
          display={display}
          today={GALLERY_TODAY}
          windowDays={7}
          variant="compact"
          onPress={notifyTap}
        />
        <Alert className={ALERT_SOFT_TONE_CLASS_NAME.warning}>
          <BellRingIcon aria-hidden="true" />
          <AlertTitle>Suscripción con aviso cobró distinto</AlertTitle>
          <AlertDescription>
            Esperado DOP $1,499.00 · cobrado DOP $1,799.00 el 24 oct
          </AlertDescription>
          <AlertAction>
            <Badge variant="warning">+DOP $300.00</Badge>
          </AlertAction>
        </Alert>
      </div>
    ),
  },
]
