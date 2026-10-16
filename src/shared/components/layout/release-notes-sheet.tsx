"use client"

import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import {
  LATEST_RELEASE_VERSION,
  RELEASE_NOTES,
} from "@/src/shared/constants/release-notes"
import {
  readCachedSeenVersion,
  resolveReleaseNotesOutcome,
  subscribeSeenVersion,
  writeCachedSeenVersion,
} from "@/src/shared/lib/release-notes"
import { CheckIcon, SparklesIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react"

export type ReleaseNotesSheetProps = {
  /** `null` = primera visita; `undefined` = el perfil aún no responde. */
  lastSeenVersion: string | null | undefined
  onMarkSeen: (version: string) => void
}

function readCachedSnapshot(): string | null {
  return readCachedSeenVersion(window.localStorage)
}

/** Durante el render del servidor no hay `localStorage`: la hoja nace cerrada. */
function getServerCachedSnapshot(): string | null {
  return null
}

/**
 * Hoja global «Novedades» del shell autenticado. La última versión vista vive
 * en el perfil; `localStorage` es solo la caché que evita mostrar la hoja
 * mientras el perfil carga.
 */
export function ReleaseNotesSheet({
  lastSeenVersion,
  onMarkSeen,
}: ReleaseNotesSheetProps) {
  const cachedSeenVersion = useSyncExternalStore(
    subscribeSeenVersion,
    readCachedSnapshot,
    getServerCachedSnapshot
  )
  const markedVersion = useRef<string | null>(null)

  const outcome = resolveReleaseNotesOutcome({
    serverSeenVersion: lastSeenVersion,
    cachedSeenVersion,
    currentVersion: LATEST_RELEASE_VERSION,
    entries: RELEASE_NOTES,
  })
  const entry = outcome.action === "show" ? outcome.entry : null

  const markCurrentVersionSeen = useCallback(() => {
    if (markedVersion.current === LATEST_RELEASE_VERSION) {
      return
    }
    markedVersion.current = LATEST_RELEASE_VERSION
    writeCachedSeenVersion(window.localStorage, LATEST_RELEASE_VERSION)
    onMarkSeen(LATEST_RELEASE_VERSION)
  }, [onMarkSeen])

  useEffect(() => {
    if (outcome.action === "mark-seen") {
      markCurrentVersionSeen()
    }
  }, [outcome.action, markCurrentVersionSeen])

  const closeSheet = () => {
    if (entry === null) {
      return
    }
    markCurrentVersionSeen()
  }

  return (
    <BottomSheet
      open={entry !== null}
      onOpenChange={(open) => {
        if (!open) {
          closeSheet()
        }
      }}
      title="Novedades"
      description={entry ? `Cambios de la versión ${entry.version}` : undefined}
      actions={{
        close: (
          <Button className="flex-1" onClick={closeSheet}>
            <CheckIcon data-icon="inline-start" />
            Entendido
          </Button>
        ),
      }}
    >
      <ul className="flex flex-col gap-3">
        {entry?.highlights.map((highlight) => (
          <li key={highlight} className="flex items-start gap-2 text-sm">
            <SparklesIcon
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
