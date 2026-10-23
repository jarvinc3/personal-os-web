import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { SubscriptionCard } from "@/src/modules/finance/subscriptions/components/subscription-card"
import { NoticeCard } from "@/src/modules/card-gallery/drafts/notice-card"
import { GALLERY_TODAY } from "@/src/modules/card-gallery/mock/display"
import {
  galleryBalanceDrift,
  galleryCheckingAccount,
  galleryReconciliationItem,
  galleryWarningSubscription,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { BellRingIcon, ScaleIcon, TriangleAlertIcon } from "lucide-react"

/** Avisos con la card de su entidad (#272). */
export const alertVariants: readonly GalleryVariant[] = [
  {
    id: "aviso-descuadre",
    label: "Descuadre",
    propLabel: "cuenta compacta + aviso",
    height: "≈ 160 px",
    isDraft: true,
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
    isDraft: true,
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
    propLabel: "suscripción compacta + aviso",
    height: "≈ 150 px",
    isDraft: true,
    render: ({ display, notifyTap }) => (
      <NoticeCard
        icon={BellRingIcon}
        tone="warning"
        title="El último cobro no coincide"
        description="Revisa el monto antes del próximo cargo."
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
