import { SubscriptionCard } from "@/src/modules/finance/subscriptions/components/subscription-card"
import { GALLERY_TODAY } from "@/src/modules/card-gallery/mock/display"
import {
  galleryCheckingAccount,
  galleryCreditCard,
  galleryPausedSubscription,
  gallerySubscription,
  galleryTrialSubscription,
  galleryWarningSubscription,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"

const WINDOW_DAYS = 7

/** Variantes de la galería /dev/cards (#272). */
export const subscriptionVariants: readonly GalleryVariant[] = [
  {
    id: "suscripcion-completa",
    label: "Completa",
    propLabel: 'variant="full" (por defecto)',
    height: "≈ 180 px",
    render: ({ display, notifyTap }) => (
      <SubscriptionCard
        subscription={gallerySubscription}
        display={display}
        cards={[galleryCreditCard]}
        accounts={[galleryCheckingAccount]}
        today={GALLERY_TODAY}
        windowDays={WINDOW_DAYS}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "suscripcion-aviso",
    label: "En ventana de aviso",
    propLabel: "nextBillingDate dentro de la ventana",
    height: "≈ 190 px",
    render: ({ display, notifyTap }) => (
      <SubscriptionCard
        subscription={galleryWarningSubscription}
        display={display}
        cards={[galleryCreditCard]}
        accounts={[galleryCheckingAccount]}
        today={GALLERY_TODAY}
        windowDays={WINDOW_DAYS}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "suscripcion-compacta",
    label: "Compacta",
    propLabel: 'variant="compact"',
    height: "≈ 60 px",
    render: ({ display, notifyTap }) => (
      <SubscriptionCard
        subscription={gallerySubscription}
        display={display}
        cards={[galleryCreditCard]}
        accounts={[galleryCheckingAccount]}
        today={GALLERY_TODAY}
        windowDays={WINDOW_DAYS}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "suscripcion-inline",
    label: "Inline",
    propLabel: 'variant="inline"',
    height: "≈ 28 px",
    render: ({ display, notifyTap }) => (
      <SubscriptionCard
        subscription={gallerySubscription}
        display={display}
        cards={[galleryCreditCard]}
        accounts={[galleryCheckingAccount]}
        today={GALLERY_TODAY}
        windowDays={WINDOW_DAYS}
        variant="inline"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "suscripcion-pausada",
    label: "Pausada",
    propLabel: 'status="PAUSED"',
    height: "≈ 180 px",
    render: ({ display, notifyTap }) => (
      <SubscriptionCard
        subscription={galleryPausedSubscription}
        display={display}
        cards={[galleryCreditCard]}
        accounts={[galleryCheckingAccount]}
        today={GALLERY_TODAY}
        windowDays={WINDOW_DAYS}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "suscripcion-gratis",
    label: "Gratis",
    propLabel: "trialEndsAt futuro",
    height: "≈ 180 px",
    render: ({ display, notifyTap }) => (
      <SubscriptionCard
        subscription={galleryTrialSubscription}
        display={display}
        cards={[galleryCreditCard]}
        accounts={[galleryCheckingAccount]}
        today={GALLERY_TODAY}
        windowDays={WINDOW_DAYS}
        onPress={notifyTap}
      />
    ),
  },
]
