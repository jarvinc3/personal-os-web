import type { ReleaseNotesEntry } from "@/src/shared/constants/release-notes"

export const RELEASE_NOTES_SEEN_VERSION_KEY = "releaseNotesSeenVersion" as const
export const RELEASE_NOTES_SEEN_EVENT = "release-notes-seen-changed" as const

/** Lo mínimo que las notas necesitan del almacenamiento del navegador. */
export type ReleaseNotesStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type ReleaseNotesOutcome =
  | { action: "none" }
  | { action: "mark-seen" }
  | { action: "show"; entry: ReleaseNotesEntry }

type ResolveReleaseNotesOutcomeOptions = {
  seenVersion: string | null
  currentVersion: string
  entries: readonly ReleaseNotesEntry[]
}

export function readSeenVersion(storage: ReleaseNotesStorage): string | null {
  return storage.getItem(RELEASE_NOTES_SEEN_VERSION_KEY)
}

export function markVersionSeen(
  storage: ReleaseNotesStorage,
  version: string
): void {
  storage.setItem(RELEASE_NOTES_SEEN_VERSION_KEY, version)
  if (typeof window === "undefined") {
    return
  }
  window.dispatchEvent(new Event(RELEASE_NOTES_SEEN_EVENT))
}

export function subscribeSeenVersion(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }
  const handler = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key &&
      event.key !== RELEASE_NOTES_SEEN_VERSION_KEY
    ) {
      return
    }
    onChange()
  }
  window.addEventListener("storage", handler)
  window.addEventListener(RELEASE_NOTES_SEEN_EVENT, handler)
  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener(RELEASE_NOTES_SEEN_EVENT, handler)
  }
}

export function findReleaseNotesEntry(
  entries: readonly ReleaseNotesEntry[],
  version: string
): ReleaseNotesEntry | null {
  return entries.find((entry) => entry.version === version) ?? null
}

/**
 * Decide qué hacer al abrir el shell autenticado. La primera visita y una
 * versión sin notas curadas no muestran la hoja: solo marcan la versión.
 */
export function resolveReleaseNotesOutcome({
  seenVersion,
  currentVersion,
  entries,
}: ResolveReleaseNotesOutcomeOptions): ReleaseNotesOutcome {
  if (seenVersion === currentVersion) {
    return { action: "none" }
  }
  const entry = findReleaseNotesEntry(entries, currentVersion)
  if (!entry || seenVersion === null) {
    return { action: "mark-seen" }
  }
  return { action: "show", entry }
}
