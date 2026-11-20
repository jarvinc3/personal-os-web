"use client"

import { useState } from "react"

import { ViewSuggestionsRow } from "@/src/modules/intelligence/components/view-suggestions-row"
import { useViewSuggestions } from "@/src/modules/intelligence/hooks/use-view-suggestions"
import {
  hideViewSuggestions,
  isViewSuggestionsHidden,
  type ViewSuggestionScope,
} from "@/src/modules/intelligence/lib/view-suggestions"
import type { ViewSuggestion } from "@/src/modules/intelligence/types/view-suggestions.types"

/**
 * Fila fuera del overlay, encima del tab bar. La X oculta la fila solo en esta
 * sesión y esta vista; no descarta la sugerencia.
 */
export function ViewSuggestionsBar({
  scope,
  onSelect,
}: {
  scope: ViewSuggestionScope
  onSelect: (suggestion: ViewSuggestion) => void
}) {
  const [hidden, setHidden] = useState(() => isViewSuggestionsHidden(scope))
  const suggestionsQuery = useViewSuggestions(scope, !hidden)
  const suggestions = suggestionsQuery.data?.suggestions ?? []

  if (hidden || suggestions.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(3.5rem+max(0.75rem,env(safe-area-inset-bottom)))] z-40 px-3">
      <div className="pointer-events-auto mx-auto w-full max-w-3xl">
        <ViewSuggestionsRow
          suggestions={suggestions}
          variant="bar"
          onSelect={onSelect}
          onHide={() => {
            hideViewSuggestions(scope)
            setHidden(true)
          }}
        />
      </div>
    </div>
  )
}
