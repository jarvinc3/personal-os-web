import { InstitutionWalletCard } from "@/src/modules/finance/products/components/institution-wallet-card"
import {
  galleryCashCard,
  galleryInstitutionCard,
  galleryInstitutionWithDriftCard,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"

/** Variantes de la galería /dev/cards (#272). */
export const institutionVariants: readonly GalleryVariant[] = [
  {
    id: "institucion-completa",
    label: "Completa",
    propLabel: 'variant="full" (por defecto)',
    height: "≈ 240 px",
    render: ({ notifyTap }) => (
      <InstitutionWalletCard
        card={galleryInstitutionCard}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "institucion-compacta-none",
    label: "Compacta sin detalle",
    propLabel: 'variant="compact" · detail="none"',
    height: "≈ 64 px",
    render: ({ notifyTap }) => (
      <InstitutionWalletCard
        card={galleryInstitutionCard}
        variant="compact"
        detail="none"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "institucion-compacta-counts",
    label: "Compacta con conteos",
    propLabel: 'variant="compact" · detail="counts"',
    height: "≈ 68 px",
    render: ({ notifyTap }) => (
      <InstitutionWalletCard
        card={galleryInstitutionCard}
        variant="compact"
        detail="counts"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "institucion-compacta-balance",
    label: "Compacta con balance",
    propLabel: 'variant="compact" · detail="balance"',
    height: "≈ 64 px",
    render: ({ notifyTap }) => (
      <InstitutionWalletCard
        card={galleryInstitutionCard}
        variant="compact"
        detail="balance"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "institucion-efectivo",
    label: "Efectivo",
    propLabel: 'card.item.kind = "cash"',
    height: "≈ 240 px",
    render: ({ notifyTap }) => (
      <InstitutionWalletCard card={galleryCashCard} onPress={notifyTap} />
    ),
  },
  {
    id: "institucion-descuadre",
    label: "Con descuadre",
    propLabel: "irregularities.drift · reconciliation",
    height: "≈ 240 px",
    render: ({ notifyTap }) => (
      <InstitutionWalletCard
        card={galleryInstitutionWithDriftCard}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "institucion-cargando",
    label: "Cargando",
    propLabel: "isPending",
    height: "≈ 240 px",
    render: () => (
      <InstitutionWalletCard card={galleryInstitutionCard} isPending />
    ),
  },
]
