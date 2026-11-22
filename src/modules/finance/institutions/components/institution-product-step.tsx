"use client"

import {
  InstitutionWalletCard,
  type InstitutionCardModel,
} from "@/src/modules/finance/products"
import { Button } from "@/src/shared/components/ui/button"
import { IconBadge } from "@/src/shared/components/data-display/icon-badge"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  CheckIcon,
  CreditCardIcon,
  HandCoinsIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"

export type InstitutionProductChoice = "account" | "card" | "loan"

const PRODUCT_OPTIONS = [
  {
    id: "account" as const,
    title: "Cuenta",
    description: "Ahorros, corriente",
    icon: WalletIcon,
  },
  {
    id: "card" as const,
    title: "Tarjeta",
    description: "Crédito o débito",
    icon: CreditCardIcon,
  },
  {
    id: "loan" as const,
    title: "Préstamo",
    description: "Cuotas y saldo",
    icon: HandCoinsIcon,
  },
]

type InstitutionProductStepProps = {
  institutionId: string
  name: string
  card: InstitutionCardModel
  onAddProduct?: (
    choice: InstitutionProductChoice,
    institutionId: string
  ) => void
  onSkip: () => void
}

export function InstitutionProductStep({
  institutionId,
  name,
  card,
  onAddProduct,
  onSkip,
}: InstitutionProductStepProps) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <InstitutionWalletCard card={card} />
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <IconBadge tone="success" size={48}>
          <CheckIcon className="size-6" />
        </IconBadge>
        <p className="text-base font-medium">{name} lista</p>
        <p className="text-sm text-muted-foreground">
          ¿Agregamos tu primer producto?
        </p>
      </div>
      <SummarySection title="Agregar" icon={WalletIcon}>
        {PRODUCT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onAddProduct?.(option.id, institutionId)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left",
              PRESSABLE_CLASS
            )}
          >
            <option.icon className="size-4.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{option.title}</span>
              <span className="block text-xs text-muted-foreground">
                {option.description}
              </span>
            </span>
          </button>
        ))}
      </SummarySection>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={onSkip}
      >
        <XIcon className="size-4 shrink-0" />
        Ahora no
      </Button>
    </div>
  )
}
