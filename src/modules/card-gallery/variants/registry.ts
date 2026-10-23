import type { CardGalleryEntitySlug } from "@/src/modules/card-gallery/entities"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"
import { accountVariants } from "@/src/modules/card-gallery/variants/accounts"
import { alertVariants } from "@/src/modules/card-gallery/variants/alerts"
import { cardVariants } from "@/src/modules/card-gallery/variants/cards"
import { categoryVariants } from "@/src/modules/card-gallery/variants/categories"
import { chatVariants } from "@/src/modules/card-gallery/variants/chat"
import { institutionVariants } from "@/src/modules/card-gallery/variants/institutions"
import { loanVariants } from "@/src/modules/card-gallery/variants/loans"
import { merchantVariants } from "@/src/modules/card-gallery/variants/merchants"
import {
  movementDetailVariants,
  movementVariants,
  statementMovementVariants,
} from "@/src/modules/card-gallery/variants/movements"
import { notificationVariants } from "@/src/modules/card-gallery/variants/notifications"
import {
  budgetVariants,
  goalVariants,
  receivableVariants,
} from "@/src/modules/card-gallery/variants/planning"
import { recurringVariants } from "@/src/modules/card-gallery/variants/recurring"
import { subscriptionVariants } from "@/src/modules/card-gallery/variants/subscriptions"
import { syncVariants } from "@/src/modules/card-gallery/variants/sync"
import { wealthVariants } from "@/src/modules/card-gallery/variants/wealth"

/**
 * PROVISIONAL (#272): every entity and its variants. Delete with the gallery
 * in #290.
 */
const CARD_GALLERY_VARIANTS: Record<
  CardGalleryEntitySlug,
  readonly GalleryVariant[]
> = {
  institucion: institutionVariants,
  cuenta: accountVariants,
  tarjeta: cardVariants,
  prestamo: loanVariants,
  meta: goalVariants,
  cobro: receivableVariants,
  presupuesto: budgetVariants,
  suscripcion: subscriptionVariants,
  categoria: categoryVariants,
  comercio: merchantVariants,
  movimiento: movementVariants,
  "detalle-movimiento": movementDetailVariants,
  "estado-cuenta": statementMovementVariants,
  patrimonio: wealthVariants,
  recurrente: recurringVariants,
  correo: syncVariants,
  notificacion: notificationVariants,
  chat: chatVariants,
  avisos: alertVariants,
}

export function cardGalleryVariants(
  slug: CardGalleryEntitySlug
): readonly GalleryVariant[] {
  return CARD_GALLERY_VARIANTS[slug]
}
