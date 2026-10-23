import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { MerchantCard } from "@/src/modules/card-gallery/provisional/merchant-card"
import { TintedSurface } from "@/src/modules/card-gallery/provisional/tinted-surface"
import { galleryMoney } from "@/src/modules/card-gallery/mock/display"
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

const spendLabel = galleryMoney(galleryMerchant.monthSpend)
const movementsLabel = `${galleryMerchant.monthMovements} movimientos`

/** PROVISIONAL (#272): merchant card is new (#281). */
export const merchantVariants: readonly GalleryVariant[] = [
  {
    id: "comercio-completa",
    label: "Completa con tinte de categoría",
    propLabel: 'variant="full"',
    height: "≈ 150 px",
    render: ({ notifyTap }) => (
      <MerchantCard
        name={galleryMerchant.name}
        logoUrl={galleryMerchant.logoUrl}
        category={category}
        spendLabel={spendLabel}
        movementsLabel={movementsLabel}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-sin-categoria",
    label: "Sin categoría",
    propLabel: "category = null",
    height: "≈ 150 px",
    render: ({ notifyTap }) => (
      <MerchantCard
        name={galleryMerchantWithoutCategory.name}
        logoUrl={galleryMerchantWithoutCategory.logoUrl}
        category={null}
        spendLabel={galleryMoney(galleryMerchantWithoutCategory.monthSpend)}
        movementsLabel={`${galleryMerchantWithoutCategory.monthMovements} movimientos`}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-con-alias",
    label: "Con alias",
    propLabel: "alias",
    height: "≈ 150 px",
    render: ({ notifyTap }) => (
      <MerchantCard
        name={galleryMerchant.name}
        logoUrl={galleryMerchant.logoUrl}
        alias={galleryMerchant.aliases[0]}
        category={category}
        spendLabel={spendLabel}
        movementsLabel={movementsLabel}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-duplicado",
    label: "Con ¿Duplicado?",
    propLabel: "duplicate",
    height: "≈ 150 px",
    render: ({ notifyTap }) => (
      <MerchantCard
        name={galleryMerchant.name}
        logoUrl={galleryMerchant.logoUrl}
        category={category}
        spendLabel={spendLabel}
        movementsLabel={movementsLabel}
        duplicate
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-compacta",
    label: "Compacta",
    propLabel: 'variant="compact"',
    height: "≈ 60 px",
    render: ({ notifyTap }) => (
      <MerchantCard
        name={galleryMerchant.name}
        logoUrl={galleryMerchant.logoUrl}
        category={category}
        spendLabel={spendLabel}
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
    render: ({ notifyTap }) => (
      <MerchantCard
        name={galleryMerchant.name}
        logoUrl={galleryMerchant.logoUrl}
        category={category}
        variant="inline"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-seleccionada",
    label: "Seleccionada",
    propLabel: "selected",
    height: "≈ 60 px",
    render: ({ notifyTap }) => (
      <MerchantCard
        name={galleryMerchant.name}
        logoUrl={galleryMerchant.logoUrl}
        category={category}
        spendLabel={spendLabel}
        variant="compact"
        selected
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "comercio-base-tintada",
    label: "Base tintada compartida",
    propLabel: "TintedSurface (provisional)",
    height: "≈ 100 px",
    provisional: true,
    render: () => (
      <TintedSurface color={gallerySuperCategory.color} className="p-4">
        <span className="flex items-center gap-3">
          <BrandLogo name={gallerySuperCategory.name} size={36} />
          <span className="min-w-0">
            <span className="block truncate font-semibold">
              Contenido sobre la base
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              Tinte al 22% del color de la categoría sobre la superficie
            </span>
          </span>
        </span>
      </TintedSurface>
    ),
  },
]
