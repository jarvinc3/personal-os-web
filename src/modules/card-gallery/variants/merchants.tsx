import { MerchantCard } from "@/src/modules/finance/merchants/components/merchant-card"
import {
  galleryMerchant,
  galleryMerchantWithoutCategory,
  gallerySuperCategory,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"

const category = {
  name: gallerySuperCategory.name,
  icon: gallerySuperCategory.icon,
  color: gallerySuperCategory.color,
}

/** Variantes de comercio (#272). */
export const merchantVariants: readonly GalleryVariant[] = [
  {
    id: "comercio-completa",
    label: "Completa con tinte de categoría",
    propLabel: 'variant="full"',
    height: "≈ 130 px",
    render: ({ display, notifyTap }) => (
      <MerchantCard
        merchant={galleryMerchant}
        category={category}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-sin-categoria",
    label: "Sin categoría",
    propLabel: "category = null",
    height: "≈ 130 px",
    render: ({ display, notifyTap }) => (
      <MerchantCard
        merchant={galleryMerchantWithoutCategory}
        category={null}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-con-alias",
    label: "Cabecera con alias",
    propLabel: 'size="header"',
    height: "≈ 150 px",
    render: ({ display, notifyTap }) => (
      <MerchantCard
        merchant={galleryMerchant}
        category={category}
        display={display}
        size="header"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-duplicado",
    label: "Con ¿Duplicado?",
    propLabel: "duplicate",
    height: "≈ 130 px",
    render: ({ display, notifyTap }) => (
      <MerchantCard
        merchant={galleryMerchant}
        category={category}
        display={display}
        duplicate
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-compacta",
    label: "Compacta",
    propLabel: 'variant="compact"',
    height: "≈ 56 px",
    render: ({ display, notifyTap }) => (
      <MerchantCard
        merchant={galleryMerchant}
        category={category}
        display={display}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-inline",
    label: "Inline",
    propLabel: 'variant="inline"',
    height: "≈ 28 px",
    render: ({ display, notifyTap }) => (
      <MerchantCard
        merchant={galleryMerchant}
        category={category}
        display={display}
        variant="inline"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-seleccionada",
    label: "Seleccionada",
    propLabel: "selected",
    height: "≈ 56 px",
    render: ({ display, notifyTap }) => (
      <MerchantCard
        merchant={galleryMerchant}
        category={category}
        display={display}
        variant="compact"
        selected
        onPress={notifyTap}
      />
    ),
  },
]
