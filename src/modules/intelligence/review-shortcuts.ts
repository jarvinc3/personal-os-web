export type ReviewShortcut =
  "confirm" | "correct" | "reject" | "next" | "previous"

const SHORTCUT_BY_KEY: Record<string, ReviewShortcut> = {
  c: "confirm",
  e: "correct",
  r: "reject",
  j: "next",
  arrowright: "next",
  k: "previous",
  arrowleft: "previous",
}

export const REVIEW_SHORTCUT_HELP: ReadonlyArray<{
  key: string
  label: string
}> = [
  { key: "C", label: "Confirmar" },
  { key: "E", label: "Corregir" },
  { key: "R", label: "Rechazar" },
  { key: "J", label: "Siguiente" },
  { key: "K", label: "Anterior" },
  { key: "Esc", label: "Salir" },
]

type ReviewShortcutInput = {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  /** El foco está en un campo de texto o en un selector abierto. */
  isBlockedTarget: boolean
}

/**
 * Traduce una tecla a una acción del modo foco. Con modificador no actúa, para
 * no pisar los atajos del navegador, y dentro de un campo tampoco.
 */
export function resolveReviewShortcut({
  key,
  ctrlKey,
  metaKey,
  altKey,
  isBlockedTarget,
}: ReviewShortcutInput): ReviewShortcut | null {
  if (isBlockedTarget || ctrlKey || metaKey || altKey) {
    return null
  }
  return SHORTCUT_BY_KEY[key.toLowerCase()] ?? null
}
