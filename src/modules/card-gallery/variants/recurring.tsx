import { MerchantCard } from "@/src/modules/card-gallery/drafts/merchant-card"
import { galleryMoney } from "@/src/modules/card-gallery/mock/display"
import {
  galleryMerchant,
  galleryRecurringPattern,
  gallerySuperCategory,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"
import { Button } from "@/src/shared/components/ui/button"
import { CheckIcon } from "lucide-react"

/** Recurrente detectado con su acción; borrador hasta #286 (#272). */
export const recurringVariants: readonly GalleryVariant[] = [
  {
    id: "recurrente-confirmar",
    label: "Comercio compacto con Confirmar",
    propLabel: "MerchantCard compact + acción",
    height: "≈ 110 px",
    isDraft: true,
    render: ({ notifyTap }) => (
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2">
        <MerchantCard
          name={galleryRecurringPattern.merchantName}
          logoUrl={galleryRecurringPattern.logoUrl}
          category={{
            name: gallerySuperCategory.name,
            icon: gallerySuperCategory.icon,
            color: gallerySuperCategory.color,
          }}
          spendLabel={galleryMoney(galleryRecurringPattern.avgAmount)}
          variant="compact"
          onPress={notifyTap}
        />
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs text-muted-foreground">
            Detectado cada 30 días
          </span>
          <Button type="button" size="sm" variant="outline" onClick={notifyTap}>
            <CheckIcon className="size-4 shrink-0" />
            Confirmar
          </Button>
        </div>
      </div>
    ),
  },
  {
    id: "recurrente-completo",
    label: "Comercio completo detectado",
    propLabel: "MerchantCard full",
    height: "≈ 190 px",
    isDraft: true,
    render: ({ notifyTap }) => (
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2">
        <MerchantCard
          name={galleryMerchant.name}
          logoUrl={galleryMerchant.logoUrl}
          category={{
            name: gallerySuperCategory.name,
            icon: gallerySuperCategory.icon,
            color: gallerySuperCategory.color,
          }}
          spendLabel={galleryMoney(galleryRecurringPattern.avgAmount)}
          movementsLabel="Recurrente"
          onPress={notifyTap}
        />
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs text-muted-foreground">
            Cada 30 días · confianza 86%
          </span>
          <Button type="button" size="sm" variant="outline" onClick={notifyTap}>
            <CheckIcon className="size-4 shrink-0" />
            Confirmar
          </Button>
        </div>
      </div>
    ),
  },
]
