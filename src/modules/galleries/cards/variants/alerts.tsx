import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { NoticeCard } from "@/src/modules/finance/shared/components/notice-card"
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
      <NoticeCard
        icon={TriangleAlertIcon}
        tone="danger"
        title="Saldo descuadrado"
        description={`Guardado ${formatFinanceMoney(galleryBalanceDrift.storedBalance, display)} · Debería ser ${formatFinanceMoney(galleryBalanceDrift.expectedBalance, display)} · Diferencia ${formatFinanceMoney(galleryBalanceDrift.difference, display)}`}
      >
        <AccountProductRow
          account={galleryCheckingAccount}
          display={display}
          variant="compact"
          onPress={notifyTap}
        />
      </NoticeCard>
    ),
  },
  {
    id: "aviso-sin-conciliar",
    label: "Sin conciliar",
    propLabel: "cuenta compacta + aviso",
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <NoticeCard
        icon={ScaleIcon}
        tone="warning"
        title={`${galleryReconciliationItem.name} sin conciliar`}
        description={`Balance ${formatFinanceMoney(galleryReconciliationItem.balance, display)} · Última conciliación 30 sep 2026`}
      >
        <AccountProductRow
          account={galleryCheckingAccount}
          display={display}
          variant="compact"
          onPress={notifyTap}
        />
      </NoticeCard>
    ),
  },
  {
    id: "aviso-suscripcion",
    label: "Alerta de suscripción",
    propLabel: "aviso + suscripción compacta",
    height: "≈ 170 px",
    render: ({ display, notifyTap }) => (
      <NoticeCard
        icon={BellRingIcon}
        tone="warning"
        title="Suscripción con aviso cobró distinto"
        description="Esperado DOP $1,499.00 · cobrado DOP $1,799.00 el 24 oct"
        trailing={<Badge variant="warning">+DOP $300.00</Badge>}
      >
        <SubscriptionCard
          subscription={galleryWarningSubscription}
          display={display}
          today={GALLERY_TODAY}
          windowDays={7}
          variant="compact"
          onPress={notifyTap}
        />
      </NoticeCard>
    ),
  },
]
