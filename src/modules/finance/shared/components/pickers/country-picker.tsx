"use client"

import {
  COUNTRY_OPTIONS,
  countryName,
} from "@/src/modules/finance/shared/lib/countries"
import { foldSearchText } from "@/src/shared/lib/search-text"
import {
  EMPTY_COMPACT_CLASS_NAME,
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Field } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
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
        <Field className="gap-0.5">
          <InputGroup className="h-10 min-h-10 overflow-hidden px-1">
            <InputGroupAddon align="inline-start">
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar país"
              aria-label="Buscar país"
              autoComplete="off"
            />
          </InputGroup>
        </Field>
      </div>
      {visible.length === 0 ? (
        <Empty className={EMPTY_COMPACT_CLASS_NAME}>
          <EmptyHeader>
            <EmptyTitle>Ningún país coincide</EmptyTitle>
          </EmptyHeader>
        </Empty>
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
