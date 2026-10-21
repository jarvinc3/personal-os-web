"use client"

import {
  CurrencyFlag,
  CurrencyTriggerLabel,
} from "@/src/modules/finance/shared/components/currency-flag"
import { useCurrencies } from "@/src/modules/finance/shared/hooks/use-currencies"
import { currencyDisplayName } from "@/src/modules/finance/shared/lib/currency-display-name"
import { foldSearchText } from "@/src/shared/lib/search-text"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { CheckIcon, SearchIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type CurrencyPickerSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  enabled: boolean
  onSelect: (code: string) => void
  excludeCodes?: string[]
  title?: string
  /** Filter the list by ISO code or Spanish currency name. */
  searchable?: boolean
  /** Show the Spanish name under the code. */
  showNames?: boolean
  /** When set, only these codes are listed, in this order. The full catalog is not loaded. */
  codes?: readonly string[]
  /** Value of 1 unit of each code, expressed in `quoteCurrency`. Shown on the right of each card. */
  quotes?: ReadonlyMap<string, string | null>
  quoteCurrency?: string
}

function formatQuote(
  rate: string | null | undefined,
  currency: string,
  locale: string
): string {
  if (rate == null || rate === "") {
    return "—"
  }
  return formatFinanceMoney(Number(rate), {
    currency,
    showCents: true,
    compactNumbers: false,
    locale,
  })
}

export function CurrencyPickerSheet({
  open,
  onOpenChange,
  value,
  enabled,
  onSelect,
  excludeCodes = [],
  title = "Moneda",
  searchable = false,
  showNames = false,
  codes: allowedCodes,
  quotes,
  quoteCurrency,
}: CurrencyPickerSheetProps) {
  const formatLocale = useFormatLocale()
  const [search, setSearch] = useState("")
  const restricted = allowedCodes !== undefined
  const currenciesQuery = useCurrencies(enabled && open && !restricted)
  const current = value.trim().toUpperCase()
  const excluded = useMemo(
    () =>
      new Set(
        excludeCodes.map((code) => code.trim().toUpperCase()).filter(Boolean)
      ),
    [excludeCodes]
  )
  const listed = useMemo(() => {
    const seen = new Set<string>()
    const listedCodes: string[] = []
    const source = restricted
      ? (allowedCodes ?? [])
      : (currenciesQuery.data ?? [])
    for (const code of source) {
      const normalized = code.trim().toUpperCase()
      if (!normalized || excluded.has(normalized) || seen.has(normalized)) {
        continue
      }
      seen.add(normalized)
      listedCodes.push(normalized)
    }
    if (
      !restricted &&
      current &&
      !excluded.has(current) &&
      !seen.has(current)
    ) {
      listedCodes.push(current)
    }
    return restricted ? listedCodes : listedCodes.sort()
  }, [restricted, allowedCodes, currenciesQuery.data, current, excluded])

  const showQuotes = Boolean(quoteCurrency)
  const visible = useMemo(() => {
    if (!searchable) {
      return listed
    }
    const needle = foldSearchText(search.trim())
    if (!needle) {
      return listed
    }
    return listed.filter((code) => {
      const name = currencyDisplayName(code)
      return (
        foldSearchText(code).includes(needle) ||
        foldSearchText(name).includes(needle)
      )
    })
  }, [listed, search, searchable])

  useEffect(() => {
    if (!open) {
      // A picker can be replaced by another sheet without a close callback,
      // so reset on the open flag instead of the close handler.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch("")
    }
  }, [open])

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      {searchable ? (
        <div className="sticky top-0 z-10 shrink-0 bg-background">
          <FormTextField
            icon={SearchIcon}
            type="search"
            value={search}
            onChange={setSearch}
            placeholder="Buscar por código o nombre"
            ariaLabel="Buscar moneda"
            autoComplete="off"
            className="min-h-10"
          />
        </div>
      ) : null}
      {!restricted && currenciesQuery.isPending && listed.length === 0 ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : listed.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No hay otras monedas.
        </p>
      ) : visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Ninguna moneda coincide.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((code) => {
            const selected = code === current
            return (
              <button
                key={code}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left",
                  PRESSABLE_CLASS,
                  selected && "border-primary"
                )}
                onClick={() => {
                  onSelect(code)
                  onOpenChange(false)
                }}
              >
                {showNames ? (
                  <span className="flex min-w-0 items-center gap-3">
                    <CurrencyFlag code={code} />
                    <span className="min-w-0">
                      <span className="block text-sm">{code}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {currencyDisplayName(code)}
                      </span>
                    </span>
                  </span>
                ) : (
                  <CurrencyTriggerLabel code={code} />
                )}
                <span className="flex shrink-0 items-center gap-2">
                  {showQuotes ? (
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {code === quoteCurrency
                        ? "Principal"
                        : formatQuote(
                            quotes?.get(code),
                            quoteCurrency ?? "",
                            formatLocale
                          )}
                    </span>
                  ) : null}
                  {selected ? <CheckIcon className="size-4" /> : null}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </BottomSheet>
  )
}
