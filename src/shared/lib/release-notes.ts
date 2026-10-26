import {
  RELEASE_NOTES_QUIET_PREFIX,
  type ReleaseNotesEntry,
} from "@/src/shared/constants/release-notes"

export const RELEASE_NOTES_SEEN_VERSION_KEY = "releaseNotesSeenVersion" as const
export const RELEASE_NOTES_SEEN_EVENT = "release-notes-seen-changed" as const

/** Lo mínimo que las notas necesitan del almacenamiento del navegador. */
export type ReleaseNotesStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** Versiones con notas que la hoja muestra como máximo; el resto se resume. */
export const RELEASE_NOTES_MAX_VERSIONS = 10

export type ReleaseNotesOutcome =
  | { action: "wait" }
  | { action: "none" }
  | { action: "mark-seen" }
  | {
      action: "show"
      /** Versión que el usuario ya vio: el encabezado describe el rango desde ella. */
      sinceVersion: string
      /** Versiones no vistas con cambios visibles, de la más nueva a la más vieja. */
      entries: readonly ReleaseNotesEntry[]
      /** Versiones no vistas con cambios visibles que quedan fuera de la lista. */
      olderCount: number
    }

type ResolveReleaseNotesOutcomeOptions = {
  /** `null` = primera visita; `undefined` = el perfil aún no responde. */
  serverSeenVersion: string | null | undefined
  cachedSeenVersion: string | null
  currentVersion: string
  entries: readonly ReleaseNotesEntry[]
}

export function readCachedSeenVersion(
  storage: ReleaseNotesStorage
): string | null {
  return storage.getItem(RELEASE_NOTES_SEEN_VERSION_KEY)
}

export function writeCachedSeenVersion(
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

const RELEASE_VERSION_PATTERN = /^\d+\.\d+\.\d+$/

function parseReleaseVersion(version: string): [number, number, number] {
  if (!RELEASE_VERSION_PATTERN.test(version)) {
    throw new Error(`Versión sin formato X.Y.Z: ${version}`)
  }
  const [major, minor, patch] = version.split(".").map(Number)
  return [major, minor, patch]
}

/** Compara por número de versión: `0.58.10` va después de `0.58.9`. */
export function compareReleaseVersions(left: string, right: string): number {
  const leftParts = parseReleaseVersion(left)
  const rightParts = parseReleaseVersion(right)
  for (let index = 0; index < leftParts.length; index += 1) {
    const difference = leftParts[index] - rightParts[index]
    if (difference !== 0) {
      return difference
    }
  }
  return 0
}

/** Una nota que solo dice «Sin cambios visibles…» no es una novedad. */
export function hasVisibleReleaseNotes(entry: ReleaseNotesEntry): boolean {
  return entry.highlights.some(
    (highlight) => !highlight.startsWith(RELEASE_NOTES_QUIET_PREFIX)
  )
}

function collectUnseenReleaseNotes(
  entries: readonly ReleaseNotesEntry[],
  seenVersion: string
): ReleaseNotesEntry[] {
  return entries.filter(
    (entry) =>
      hasVisibleReleaseNotes(entry) &&
      compareReleaseVersions(entry.version, seenVersion) > 0
  )
}

/**
 * Decide qué hacer al abrir el shell autenticado. El perfil manda; la caché solo
 * puede adelantar que la versión actual ya se vio. Muestra las versiones no
 * vistas con cambios visibles, de la más nueva a la más vieja, y no más de
 * `RELEASE_NOTES_MAX_VERSIONS`. La primera visita, una versión ya vista y un
 * rango sin novedades visibles solo marcan la versión en silencio.
 */
export function resolveReleaseNotesOutcome({
  serverSeenVersion,
  cachedSeenVersion,
  currentVersion,
  entries,
}: ResolveReleaseNotesOutcomeOptions): ReleaseNotesOutcome {
  if (serverSeenVersion === undefined && cachedSeenVersion !== currentVersion) {
    return { action: "wait" }
  }
  const seenVersion =
    serverSeenVersion === undefined ? cachedSeenVersion : serverSeenVersion
  if (seenVersion === currentVersion) {
    return { action: "none" }
  }
  if (seenVersion === null) {
    return { action: "mark-seen" }
  }
  const unseen = collectUnseenReleaseNotes(entries, seenVersion)
  if (unseen.length === 0) {
    return { action: "mark-seen" }
  }
  return {
    action: "show",
    sinceVersion: seenVersion,
    entries: unseen.slice(0, RELEASE_NOTES_MAX_VERSIONS),
    olderCount: Math.max(unseen.length - RELEASE_NOTES_MAX_VERSIONS, 0),
  }
}
