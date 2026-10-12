"use client"

import {
  COUNTRY_OPTIONS,
  countryName,
} from "@/src/modules/finance/shared/lib/countries"
import { foldSearchText } from "@/src/modules/finance/shared/lib/search-text"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { CheckIcon, ChevronDownIcon, GlobeIcon, SearchIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type CountryTriggerProps = {
  country: string
  onClick: () => void
  placeholder?: string
}

export function CountryTrigger({
  country,
  onClick,
  placeholder = "Elige país",
}: CountryTriggerProps) {
  const label = country.trim() ? countryName(country) : placeholder
  return (
    <button
      type="button"
      className={cn(
        "flex h-14 w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 text-left",
        PRESSABLE_CLASS
      )}
      onClick={onClick}
    >
      <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {label}
      </span>
      <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}

type CountryPickerSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onSelect: (code: string) => void
}

export function CountryPickerSheet({
  open,
  onOpenChange,
  value,
  onSelect,
}: CountryPickerSheetProps) {
  const [search, setSearch] = useState("")
  const current = value.trim().toUpperCase()
  const visible = useMemo(() => {
    const needle = foldSearchText(search.trim())
    if (!needle) {
      return COUNTRY_OPTIONS
    }
    return COUNTRY_OPTIONS.filter(
      (option) =>
        foldSearchText(option.name).includes(needle) ||
        foldSearchText(option.code).includes(needle)
    )
  }, [search])

  useEffect(() => {
    if (!open) {
      // La hoja puede reemplazarse por otra sin callback de cierre.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch("")
    }
  }, [open])

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="País">
      <div className="sticky top-0 z-10 shrink-0 bg-background">
        <FormTextField
          icon={SearchIcon}
          type="search"
          value={search}
          onChange={setSearch}
          placeholder="Buscar país"
          ariaLabel="Buscar país"
          autoComplete="off"
          className="min-h-10"
        />
      </div>
      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Ningún país coincide.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((option) => {
            const selected = option.code === current
            return (
              <button
                key={option.code}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left",
                  PRESSABLE_CLASS,
                  selected && "border-primary"
                )}
                onClick={() => {
                  onSelect(option.code)
                  onOpenChange(false)
                }}
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {option.name}
                </span>
                {selected ? <CheckIcon className="size-4" /> : null}
              </button>
            )
          })}
        </div>
      )}
    </BottomSheet>
  )
}
