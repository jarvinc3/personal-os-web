import { RecurringPatternCard } from "@/src/modules/finance/subscriptions/components/recurring-pattern-card"
import {
  galleryCategories,
  galleryRecurringPattern,
} from "@/src/modules/galleries/cards/mock/finance"
import type { GalleryVariant } from "@/src/modules/galleries/cards/variants/types"
import { Button } from "@/src/shared/components/ui/button"
import { CheckIcon } from "lucide-react"

/** Recurrente detectado y su archivo con la card de comercio (#286). */
export const recurringVariants: readonly GalleryVariant[] = [
  {
    id: "recurrente-confirmar",
    label: "Detectado con Confirmar",
    propLabel: "MerchantCard compact + footer",
    height: "≈ 110 px",
    render: ({ display, notifyTap }) => (
      <RecurringPatternCard
        pattern={galleryRecurringPattern}
        categories={galleryCategories}
        display={display}
        actions={
          <Button type="button" size="sm" variant="outline" onClick={notifyTap}>
            <CheckIcon className="size-4 shrink-0" />
            Confirmar
          </Button>
        }
      />
    ),
  },
  {
    id: "recurrente-archivo",
    label: "En el archivo",
    propLabel: "footer con el contexto",
    height: "≈ 110 px",
    render: ({ display }) => (
      <RecurringPatternCard
        pattern={galleryRecurringPattern}
        categories={galleryCategories}
        display={display}
      />
    ),
  },
]
