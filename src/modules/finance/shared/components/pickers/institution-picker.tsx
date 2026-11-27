"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { InstitutionWalletCard } from "@/src/modules/finance/products/components/institution-wallet-card"
import {
  buildInstitutionCardFromCatalog,
  buildPlainInstitutionCard,
} from "@/src/modules/finance/products/lib/institution-card"
import { selectableBankInstitutions } from "@/src/modules/finance/shared/lib/cash"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import type { FinanceInstitution } from "@/src/modules/finance/shared/types/entities"
import {
  EMPTY_COMPACT_CLASS_NAME,
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { ChevronDownIcon, XIcon } from "lucide-react"

const CATALOG_NONE_COLOR = "#334155"

type InstitutionTriggerProps = {
  institution: FinanceInstitution | null
  onClick: () => void
  placeholder?: string
  disabled?: boolean
}

export function InstitutionTrigger({
  institution,
  onClick,
  placeholder = "Elige institución",
  disabled = false,
}: InstitutionTriggerProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex h-14 w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 text-left disabled:opacity-50",
        PRESSABLE_CLASS
      )}
      onClick={onClick}
    >
      <BrandLogo
        name={institution?.name ?? placeholder}
        logoUrl={institution?.logoUrl}
        size={28}
      />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {institution?.name ?? placeholder}
      </span>
      <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}

type InstitutionPickerSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institutions: FinanceInstitution[]
  value: string
  onSelect: (institutionId: string) => void
  /** Fila para "sin institución" del catálogo, p. ej. un prestamista externo. */
  noneLabel?: string
}

export function InstitutionPickerSheet({
  open,
  onOpenChange,
  institutions,
  value,
  onSelect,
  noneLabel,
}: InstitutionPickerSheetProps) {
  function choose(institutionId: string) {
    onSelect(institutionId)
    onOpenChange(false)
  }

  const selectable = selectableBankInstitutions(institutions)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader title="Institución" />
        <SheetBody>
          <div className="flex flex-col gap-2">
            {noneLabel ? (
              <InstitutionWalletCard
                card={buildPlainInstitutionCard({
                  name: noneLabel,
                  color: CATALOG_NONE_COLOR,
                })}
                variant="compact"
                detail="none"
                selected={value === CATALOG_NONE}
                onPress={() => choose(CATALOG_NONE)}
              />
            ) : null}
            {selectable.length === 0 ? (
              <Empty className={EMPTY_COMPACT_CLASS_NAME}>
                <EmptyHeader>
                  <EmptyTitle>No hay instituciones en el catálogo</EmptyTitle>
                </EmptyHeader>
              </Empty>
            ) : (
              selectable.map((institution) => (
                <InstitutionWalletCard
                  key={institution.id}
                  card={buildInstitutionCardFromCatalog({ institution })}
                  variant="compact"
                  detail="none"
                  selected={value === institution.id}
                  onPress={() => choose(institution.id)}
                />
              ))
            )}
          </div>
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
