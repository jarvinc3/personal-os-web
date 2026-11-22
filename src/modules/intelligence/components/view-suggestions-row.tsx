"use client"

import { SparklesIcon, XIcon } from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react"

import type { ViewSuggestion } from "@/src/modules/intelligence/types/view-suggestions.types"
import { cn } from "@/src/shared/lib/utils"

const FADE_SIZE = "1rem"

function maskForEdges(left: boolean, right: boolean): string | undefined {
  if (left && right) {
    return `linear-gradient(to right, transparent, black ${FADE_SIZE}, black calc(100% - ${FADE_SIZE}), transparent)`
  }
  if (left) {
    return `linear-gradient(to right, transparent, black ${FADE_SIZE})`
  }
  if (right) {
    return `linear-gradient(to right, black calc(100% - ${FADE_SIZE}), transparent)`
  }
  return undefined
}

export function ViewSuggestionsRow({
  suggestions,
  variant,
  selectedId,
  onSelect,
  onRequestDismiss,
  onHide,
}: {
  suggestions: readonly ViewSuggestion[]
  variant: "bar" | "overlay"
  selectedId?: string | null
  onSelect: (suggestion: ViewSuggestion) => void
  onRequestDismiss?: (suggestion: ViewSuggestion) => void
  onHide?: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  const updateEdges = useCallback(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }
    setEdges({
      left: element.scrollLeft > 1,
      right: element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
    })
  }, [])

  useEffect(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }
    updateEdges()
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateEdges)
    resizeObserver?.observe(element)
    element.addEventListener("scroll", updateEdges, { passive: true })
    return () => {
      resizeObserver?.disconnect()
      element.removeEventListener("scroll", updateEdges)
    }
  }, [suggestions, updateEdges])

  useEffect(() => {
    if (!selectedId) {
      return
    }
    const element = scrollRef.current?.querySelector<HTMLElement>(
      `[data-suggestion-id="${selectedId}"]`
    )
    element?.scrollIntoView({ block: "nearest", inline: "center" })
  }, [selectedId])

  const maskImage = useMemo(
    () => maskForEdges(edges.left, edges.right),
    [edges.left, edges.right]
  )
  const maskStyle: CSSProperties | undefined = maskImage
    ? { maskImage, WebkitMaskImage: maskImage }
    : undefined

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div
      className="flex w-full min-w-0 items-center gap-1"
      role="group"
      aria-label="Sugerencias del agente"
    >
      <div
        ref={scrollRef}
        className="scrollbar-hide flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overscroll-x-contain py-0.5"
        style={maskStyle}
      >
        {suggestions.map((suggestion) => {
          const selected = suggestion.id === selectedId
          return (
            <div
              key={suggestion.id}
              data-suggestion-id={suggestion.id}
              className={cn(
                "flex shrink-0 items-center rounded-full border bg-card shadow-sm",
                selected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(suggestion)}
                className="flex min-h-8 max-w-[15rem] min-w-0 items-center gap-1.5 rounded-l-full py-1 pr-2 pl-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <SparklesIcon
                  className="size-3.5 shrink-0 text-primary"
                  aria-hidden
                />
                <span className="truncate">{suggestion.label}</span>
              </button>
              {variant === "overlay" && onRequestDismiss ? (
                <button
                  type="button"
                  aria-label={`Descartar ${suggestion.label}`}
                  onClick={() => onRequestDismiss(suggestion)}
                  className="flex min-h-8 items-center rounded-r-full py-1 pr-2 pl-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <XIcon className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
      {variant === "bar" && onHide ? (
        <button
          type="button"
          aria-label="Ocultar sugerencias"
          onClick={onHide}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <XIcon className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
