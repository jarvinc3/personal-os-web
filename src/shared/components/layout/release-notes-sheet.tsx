"use client"

import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import {
  LATEST_RELEASE_VERSION,
  RELEASE_NOTES,
  type ReleaseNotesEntry,
} from "@/src/shared/constants/release-notes"
import {
  markVersionSeen,
  readSeenVersion,
  resolveReleaseNotesOutcome,
  subscribeSeenVersion,
} from "@/src/shared/lib/release-notes"
import { CheckIcon, SparklesIcon } from "lucide-react"
import { useEffect, useSyncExternalStore } from "react"

function resolveCurrentOutcome() {
  return resolveReleaseNotesOutcome({
    seenVersion: readSeenVersion(window.localStorage),
    currentVersion: LATEST_RELEASE_VERSION,
    entries: RELEASE_NOTES,
  })
}

/** Solo devuelve una entrada cuando toca mostrarla; el resto de casos no abren hoja. */
function getEntrySnapshot(): ReleaseNotesEntry | null {
  const outcome = resolveCurrentOutcome()
  return outcome.action === "show" ? outcome.entry : null
}

/** Durante el render del servidor no hay `localStorage`: la hoja nace cerrada. */
function getServerEntrySnapshot(): ReleaseNotesEntry | null {
  return null
}

/**
 * Hoja global «Novedades» del shell autenticado. La versión vista vive en
 * `localStorage`, así que se lee como almacén externo y nunca durante el
 * render del servidor: sin desajustes de hidratación.
 */
export function ReleaseNotesSheet() {
  const entry = useSyncExternalStore(
    subscribeSeenVersion,
    getEntrySnapshot,
    getServerEntrySnapshot
  )

  useEffect(() => {
    const outcome = resolveCurrentOutcome()
    if (outcome.action === "mark-seen") {
      markVersionSeen(window.localStorage, LATEST_RELEASE_VERSION)
    }
  }, [])

  const closeSheet = () => {
    if (entry === null) {
      return
    }
    markVersionSeen(window.localStorage, LATEST_RELEASE_VERSION)
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
