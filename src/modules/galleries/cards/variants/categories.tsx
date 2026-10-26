import {
  CategoryCard,
  subcategoryCountLabel,
} from "@/src/modules/finance/shared/components/category-card"
import { galleryMoney } from "@/src/modules/galleries/cards/mock/display"
import {
  galleryHomeCategory,
  gallerySuperCategory,
} from "@/src/modules/galleries/cards/mock/finance"
import type { GalleryVariant } from "@/src/modules/galleries/cards/variants/types"

const category = gallerySuperCategory

/** Variantes de la galería /settings/appearance/cards (#272). */
export const categoryVariants: readonly GalleryVariant[] = [
  {
    id: "categoria-fila",
    label: "Fila",
    propLabel: 'variant="default"',
    height: "≈ 64 px",
    render: ({ notifyTap }) => (
      <CategoryCard
        name={category.name}
        icon={category.icon}
        color={category.color}
        isSystem={category.isSystem}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "categoria-fila-pick",
    label: "Fila de selección",
    propLabel: 'variant="pick"',
    height: "≈ 64 px",
    render: ({ notifyTap }) => (
      <CategoryCard
        name={category.name}
        icon={category.icon}
        color={category.color}
        isSystem={category.isSystem}
        variant="pick"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "categoria-chip",
    label: "Chip",
    propLabel: 'variant="chip" · amount',
    height: "≈ 28 px",
    render: ({ notifyTap }) => (
      <CategoryCard
        name={category.name}
        icon={category.icon}
        color={category.color}
        isSystem={category.isSystem}
        amount={galleryMoney("1250.00")}
        variant="chip"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "categoria-chip-sin-color",
    label: "Chip sin color",
    propLabel: 'variant="chip" · color vacío',
    height: "≈ 28 px",
    render: () => (
      <CategoryCard
        name="Sin color"
        icon={null}
        color={null}
        isSystem={false}
        variant="chip"
      />
    ),
  },
  {
    id: "categoria-chip-largo",
    label: "Chip con nombre largo",
    propLabel: "el nombre se corta con puntos suspensivos",
    height: "≈ 28 px",
    render: () => (
      <div className="w-44">
        <CategoryCard
          name="Suscripciones y servicios digitales"
          icon={category.icon}
          color={category.color}
          isSystem={false}
          variant="chip"
        />
      </div>
    ),
  },
  {
    id: "categoria-inline",
    label: "Inline",
    propLabel: 'variant="inline"',
    height: "≈ 24 px",
    render: ({ notifyTap }) => (
      <CategoryCard
        name={category.name}
        icon={category.icon}
        color={category.color}
        isSystem={category.isSystem}
        variant="inline"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "categoria-subcategorias",
    label: "Con subcategorías",
    propLabel: "description con conteo",
    height: "≈ 64 px",
    render: ({ notifyTap }) => (
      <CategoryCard
        name="Casa"
        icon={galleryHomeCategory.icon}
        color={galleryHomeCategory.color}
        isSystem={galleryHomeCategory.isSystem}
        description={subcategoryCountLabel(2)}
        onPress={notifyTap}
      />
    ),
  },
]
