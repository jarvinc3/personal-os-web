"use client"

import { CurrencyTriggerLabel } from "@/src/modules/finance/components/currency-flag"
import { useCurrencies } from "@/src/modules/finance/hooks/use-currencies"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { CheckIcon } from "lucide-react"
import { useMemo } from "react"

type CurrencyPickerSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  enabled: boolean
  onSelect: (code: string) => void
  excludeCodes?: string[]
}

export function CurrencyPickerSheet({
  open,
  onOpenChange,
  value,
  enabled,
  onSelect,
  excludeCodes = [],
}: CurrencyPickerSheetProps) {
  const query = useCurrencies(enabled && open)
  const current = value.trim().toUpperCase()
  const excluded = useMemo(
    () =>
      new Set(
        excludeCodes.map((code) => code.trim().toUpperCase()).filter(Boolean)
      ),
    [excludeCodes]
  )
  const codes = useMemo(() => {
    const seen = new Set<string>()
    for (const code of query.data ?? []) {
      const normalized = code.trim().toUpperCase()
      if (normalized && !excluded.has(normalized)) {
        seen.add(normalized)
      }
    }
    if (current && !excluded.has(current)) {
      seen.add(current)
    }
    return [...seen].sort()
  }, [query.data, current, excluded])

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Moneda">
      {query.isPending && codes.length === 0 ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {codes.map((code) => {
            const selected = code === current
            return (
              <button
                key={code}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left",
                  PRESSABLE_CLASS,
                  selected && "border-primary"
                )}
                onClick={() => {
                  onSelect(code)
                  onOpenChange(false)
                }}
              >
                <CurrencyTriggerLabel code={code} />
                {selected ? <CheckIcon className="size-4" /> : null}
              </button>
            )
          })}
        </div>
      )}
    </BottomSheet>
  )
}
