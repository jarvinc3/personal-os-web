"use client"

import {
  BrandLogo,
  brandPreviewUrl,
} from "@/src/modules/finance/shared/components/brand-logo"
import { BrandPicker } from "@/src/modules/finance/shared/components/brand-picker"
import { FINANCE_INSTITUTION_TYPE_LABEL } from "@/src/modules/finance/shared/constants/catalog"
import { countryName } from "@/src/modules/finance/shared/lib/countries"
import {
  INSTITUTION_CATALOG_FILTERS,
  POPULAR_INSTITUTIONS,
  filterCatalog,
  type InstitutionCatalogEntry,
  type InstitutionCatalogFilter,
} from "@/src/modules/finance/institutions/lib/institution-catalog"
import { Button } from "@/src/shared/components/ui/button"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { PencilIcon } from "lucide-react"

type InstitutionCatalogPickerProps = {
  filter: InstitutionCatalogFilter
  onFilterChange: (filter: InstitutionCatalogFilter) => void
  onSelectEntry: (entry: InstitutionCatalogEntry) => void
  onStartBlank: () => void
}

export function InstitutionCatalogPicker({
  filter,
  onFilterChange,
  onSelectEntry,
  onStartBlank,
}: InstitutionCatalogPickerProps) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="rounded-2xl border border-border bg-card p-3">
        <BrandPicker
          onSelect={(brand) =>
            onSelectEntry({
              name: brand.name,
              domain: brand.domain,
              type: "bank",
              country: "DO",
              color: "",
            })
          }
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {INSTITUTION_CATALOG_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => onFilterChange(item.value)}
            className={cn(
              "h-9 rounded-full border px-4 text-sm",
              PRESSABLE_CLASS,
              filter === item.value
                ? "border-primary bg-primary/15 font-medium"
                : "border-border bg-card"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {filterCatalog(POPULAR_INSTITUTIONS, filter).map((entry) => (
          <button
            key={entry.domain}
            type="button"
            onClick={() => onSelectEntry(entry)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left",
              PRESSABLE_CLASS
            )}
          >
            <BrandLogo
              name={entry.name}
              logoUrl={brandPreviewUrl(entry.domain)}
              size={36}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {entry.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {FINANCE_INSTITUTION_TYPE_LABEL[entry.type]} ·{" "}
                {countryName(entry.country)}
              </span>
            </span>
          </button>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={onStartBlank}
      >
        <PencilIcon className="size-4 shrink-0" />
        Otra institución
      </Button>
    </div>
  )
}
