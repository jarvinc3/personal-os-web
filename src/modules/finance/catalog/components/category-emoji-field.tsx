"use client"

import { CATEGORY_EMOJI_GROUPS } from "@/src/modules/finance/catalog/components/category-emoji-catalog"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Input } from "@/src/shared/components/ui/input"
import { ScrollArea } from "@/src/shared/components/ui/scroll-area"
import { isSingleEmoji, takeSingleEmoji } from "@/src/shared/lib/single-emoji"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { KeyboardIcon, SearchIcon } from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim()
}

export function CategoryEmojiField({
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
}) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const normalizedQuery = normalizeSearch(query)
  const customEmoji = isSingleEmoji(query) ? takeSingleEmoji(query) : ""
  const groups = CATEGORY_EMOJI_GROUPS.map((group) => ({
    label: group.label,
    emojis: normalizedQuery
      ? group.emojis.filter((option) => {
          const haystack = normalizeSearch(
            `${option.emoji} ${option.keywords} ${group.label}`
          )
          return haystack.includes(normalizedQuery)
        })
      : group.emojis,
  })).filter((group) => group.emojis.length > 0)

  useLayoutEffect(() => {
    setHost(
      anchorRef.current?.closest<HTMLElement>("[data-emoji-panel-host]") ?? null
    )
  }, [])

  function close() {
    setOpen(false)
    setQuery("")
  }

  function selectEmoji(emoji: string) {
    onChange(emoji)
    close()
  }

  function openPhoneKeyboard() {
    const input = searchRef.current
    if (!input) {
      return
    }
    input.focus()
    if (window.matchMedia("(pointer: coarse)").matches) {
      input.click()
    }
  }

  const panel = (
    <div
      data-vaul-no-drag=""
      className="flex flex-col gap-2 overflow-hidden rounded-2xl border border-border p-3"
    >
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && customEmoji) {
                event.preventDefault()
                selectEmoji(customEmoji)
              }
            }}
            placeholder="Buscar"
            aria-label="Buscar emoji"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="pl-9"
          />
        </div>
        <button
          type="button"
          aria-label="Abrir teclado"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full border border-input text-muted-foreground",
            PRESSABLE_CLASS
          )}
          onMouseDown={(event) => event.preventDefault()}
          onClick={openPhoneKeyboard}
        >
          <KeyboardIcon className="size-4" />
        </button>
      </div>
      <ScrollArea className="h-64 touch-pan-y overscroll-contain **:data-[slot=scroll-area-scrollbar]:rounded-full **:data-[slot=scroll-area-scrollbar]:bg-background **:data-[slot=scroll-area-thumb]:bg-foreground/40">
        <div className="flex flex-col gap-3">
          {customEmoji ? (
            <button
              type="button"
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-xl bg-muted text-sm",
                PRESSABLE_CLASS
              )}
              onClick={() => selectEmoji(customEmoji)}
            >
              Usar {customEmoji}
            </button>
          ) : null}
          {groups.length === 0 && !customEmoji ? (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
              Sin resultados
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {group.label}
                </span>
                <div className="grid grid-cols-7 gap-1">
                  {group.emojis.map((option) => {
                    const selected = value === option.emoji
                    return (
                      <button
                        key={`${group.label}-${option.emoji}`}
                        type="button"
                        aria-label={option.keywords}
                        aria-pressed={selected}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-xl text-xl",
                          PRESSABLE_CLASS,
                          selected
                            ? "bg-primary/15 ring-1 ring-primary"
                            : "hover:bg-muted"
                        )}
                        onClick={() => selectEmoji(option.emoji)}
                      >
                        {option.emoji}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <Field
      data-invalid={error ? true : undefined}
      className="flex flex-col gap-1"
    >
      <FieldLabel className="text-sm text-muted-foreground">Emoji</FieldLabel>
      <div ref={anchorRef}>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-label="Elegir emoji"
          onBlur={onBlur}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex h-10 w-full items-center justify-center rounded-full border border-input bg-transparent text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30",
            !value && "text-muted-foreground",
            PRESSABLE_CLASS
          )}
        >
          {value || "🛒"}
        </button>
      </div>
      {open ? (host ? createPortal(panel, host) : panel) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
