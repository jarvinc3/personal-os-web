"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import type { FinanceInstitution } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { ChevronDownIcon } from "lucide-react"

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

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Institución">
      {noneLabel ? (
        <InstitutionRow
          name={noneLabel}
          logoUrl={null}
          selected={value === CATALOG_NONE}
          onPress={() => choose(CATALOG_NONE)}
        />
      ) : null}
      {institutions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay instituciones en el catálogo.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {institutions.map((institution) => (
            <InstitutionRow
              key={institution.id}
              name={institution.name}
              logoUrl={institution.logoUrl}
              selected={value === institution.id}
              onPress={() => choose(institution.id)}
            />
          ))}
        </div>
      )}
    </BottomSheet>
  )
}

function InstitutionRow({
  name,
  logoUrl,
  selected,
  onPress,
}: {
  name: string
  logoUrl: string | null
  selected: boolean
  onPress: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left",
        PRESSABLE_CLASS,
        selected && "border-primary"
      )}
      onClick={onPress}
    >
      <BrandLogo name={name} logoUrl={logoUrl} size={28} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {name}
      </span>
    </button>
  )
}
