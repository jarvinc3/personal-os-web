"use client"

import { BrandLogo, brandPreviewUrl } from "@/src/modules/finance/components/brand-logo"
import { apiGet } from "@/src/config/api-client"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useEffect, useState } from "react"

export type BrandHit = { name: string; domain: string }

type BrandPickerProps = {
  onSelect: (brand: BrandHit) => void
}

export function BrandPicker({ onSelect }: BrandPickerProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<BrandHit[]>([])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    const ctrl = new AbortController()
    const timer = setTimeout(() => {
      void apiGet<BrandHit[]>(
        `${API_ENDPOINTS.FINANCE.BRANDS_SEARCH}?q=${encodeURIComponent(q)}`,
        ctrl.signal,
      )
        .then((rows) => {
          if (!ctrl.signal.aborted) setResults(Array.isArray(rows) ? rows : [])
        })
        .catch(() => {
          if (!ctrl.signal.aborted) setResults([])
        })
    }, 300)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [query])

  return (
    <div className="flex flex-col gap-2">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar banco o marca"
        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
        aria-label="Buscar banco o marca"
      />
      {results.length > 0 ? (
        <ul className="flex flex-col overflow-hidden rounded-xl border border-border">
          {results.map((brand) => (
            <li key={brand.domain}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/50"
                onClick={() => {
                  onSelect(brand)
                  setQuery("")
                  setResults([])
                }}
              >
                <BrandLogo
                  name={brand.name}
                  logoUrl={brandPreviewUrl(brand.domain)}
                  size={28}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{brand.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {brand.domain}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
