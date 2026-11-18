import { ImportReviewCard } from "@/src/modules/finance/imports-review/components/import-review-card"
import {
  galleryReviewCardPayment,
  galleryReviewMissingCurrency,
  galleryReviewPurchase,
  galleryReviewTransfer,
} from "@/src/modules/galleries/cards/mock/finance"
import type { GalleryVariant } from "@/src/modules/galleries/cards/variants/types"

/** Import de correo que espera una decisión humana (#424). */
export const importReviewVariants: readonly GalleryVariant[] = [
  {
    id: "import-compra",
    label: "Compra",
    propLabel: "Con comercio y referencia",
    height: "≈ 230 px",
    render: ({ display }) => (
      <ImportReviewCard item={galleryReviewPurchase} display={display} />
    ),
  },
  {
    id: "import-transferencia",
    label: "Transferencia enviada",
    propLabel: "Con la cuenta de origen",
    height: "≈ 210 px",
    render: ({ display }) => (
      <ImportReviewCard item={galleryReviewTransfer} display={display} />
    ),
  },
  {
    id: "import-pago-tarjeta",
    label: "Pago de tarjeta",
    propLabel: "Cuenta de origen y tarjeta",
    height: "≈ 210 px",
    render: ({ display }) => (
      <ImportReviewCard item={galleryReviewCardPayment} display={display} />
    ),
  },
  {
    id: "import-sin-moneda",
    label: "Sin moneda",
    propLabel: "Omite el importe y explica el motivo",
    height: "≈ 210 px",
    render: ({ display }) => (
      <ImportReviewCard item={galleryReviewMissingCurrency} display={display} />
    ),
  },
]
