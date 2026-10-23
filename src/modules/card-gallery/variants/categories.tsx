import {
  CategoryCard,
  subcategoryCountLabel,
} from "@/src/modules/finance/shared/components/category-card"
import {
  galleryHomeCategory,
  gallerySuperCategory,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"

const category = gallerySuperCategory

/** Variantes de la galería /dev/cards (#272). */
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
    propLabel: 'variant="chip"',
    height: "≈ 24 px",
    render: ({ notifyTap }) => (
      <CategoryCard
        name={category.name}
        icon={category.icon}
        color={category.color}
        isSystem={category.isSystem}
        variant="chip"
        onPress={notifyTap}
      />
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
