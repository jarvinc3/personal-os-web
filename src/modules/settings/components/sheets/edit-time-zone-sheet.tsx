"use client"

import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn } from "@/src/shared/lib/utils"
import { CheckIcon, GlobeIcon, SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"

/** Every zone the browser knows, plus the current one when it lists an alias. */
function zoneOptions(current: string): string[] {
  const zones = new Set(Intl.supportedValuesOf("timeZone"))
  if (current) {
    zones.add(current)
  }
  return [...zones].sort((left, right) => left.localeCompare(right))
}

export function EditTimeZoneSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { profileQuery, updateProfileMutation } = useProfile()
  const current = profileQuery.data?.timezone ?? ""
  const [search, setSearch] = useState("")
  const options = useMemo(() => zoneOptions(current), [current])
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) {
      return options
    }
    return options.filter((zone) => zone.toLowerCase().includes(term))
  }, [options, search])

  function choose(zone: string) {
    if (zone === current) {
      onOpenChange(false)
      return
    }
    updateProfileMutation.mutate(
      { timezone: zone },
      {
        onSuccess: () => {
          appToast.success({ text1: "Zona horaria actualizada" })
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Zona horaria"
      description="Las fechas y horas de Finanzas se muestran en esta zona."
    >
      <FormTextField
        value={search}
        onChange={setSearch}
        placeholder="Buscar una zona"
        icon={SearchIcon}
        ariaLabel="Buscar una zona horaria"
      />
      <ul className="flex max-h-80 flex-col overflow-y-auto">
        {visible.map((zone) => {
          const isCurrent = zone === current
          return (
            <li key={zone}>
              <button
                type="button"
                onClick={() => choose(zone)}
                aria-current={isCurrent ? "true" : undefined}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2.5 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <GlobeIcon className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{zone}</span>
                </span>
                {isCurrent ? (
                  <CheckIcon className="size-4 shrink-0" aria-hidden />
                ) : null}
              </button>
            </li>
          )
        })}
        {visible.length === 0 ? (
          <li className="px-2 py-3 text-sm text-muted-foreground">
            Ninguna zona coincide.
          </li>
        ) : null}
      </ul>
    </BottomSheet>
  )
}
