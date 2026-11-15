import type { CardGalleryEntitySlug } from "@/src/modules/galleries/cards/entities"
import type { GalleryVariant } from "@/src/modules/galleries/cards/variants/types"
import { accountVariants } from "@/src/modules/galleries/cards/variants/accounts"
import { alertVariants } from "@/src/modules/galleries/cards/variants/alerts"
import { cardVariants } from "@/src/modules/galleries/cards/variants/cards"
import { categoryVariants } from "@/src/modules/galleries/cards/variants/categories"
import { chatVariants } from "@/src/modules/galleries/cards/variants/chat"
import { institutionVariants } from "@/src/modules/galleries/cards/variants/institutions"
import { loanVariants } from "@/src/modules/galleries/cards/variants/loans"
import { merchantVariants } from "@/src/modules/galleries/cards/variants/merchants"
import {
  movementDetailVariants,
  movementVariants,
  statementMovementVariants,
} from "@/src/modules/galleries/cards/variants/movements"
import { notificationVariants } from "@/src/modules/galleries/cards/variants/notifications"
import {
  budgetVariants,
  goalVariants,
  receivableVariants,
} from "@/src/modules/galleries/cards/variants/planning"
import { proposalVariants } from "@/src/modules/galleries/cards/variants/proposal"
import { recurringVariants } from "@/src/modules/galleries/cards/variants/recurring"
import { subscriptionVariants } from "@/src/modules/galleries/cards/variants/subscriptions"
import { wealthVariants } from "@/src/modules/galleries/cards/variants/wealth"

/** Variantes de cada entidad, en el orden en que se muestran (#272). */
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
  detectado: proposalVariants,
  notificacion: notificationVariants,
  chat: chatVariants,
  avisos: alertVariants,
}

export function cardGalleryVariants(
  slug: CardGalleryEntitySlug
): readonly GalleryVariant[] {
  return CARD_GALLERY_VARIANTS[slug]
}
