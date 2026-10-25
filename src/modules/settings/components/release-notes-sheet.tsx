"use client"

import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import {
  LATEST_RELEASE_VERSION,
  RELEASE_NOTES,
} from "@/src/shared/constants/release-notes"
import {
  SHEET_QUERY_KEY,
  useSheetParam,
} from "@/src/shared/hooks/use-sheet-params"
import {
  readCachedSeenVersion,
  resolveReleaseNotesOutcome,
  subscribeSeenVersion,
  writeCachedSeenVersion,
} from "@/src/shared/lib/release-notes"
import { CheckIcon, SparklesIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react"

const RELEASE_NOTES_SHEET_KEY = "release-notes-sheet"

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

function describeHiddenVersions(count: number): string {
  return count === 1
    ? "Hay 1 versión anterior sin mostrar."
    : `Hay ${count} versiones anteriores sin mostrar.`
}

/**
 * Hoja global «Novedades» del shell autenticado. La abre la ruta
 * (`?sheet=release-notes-sheet`), que se escribe sola cuando hay versiones sin
 * ver. La última versión vista vive en el perfil; `localStorage` es solo la
 * caché que evita mostrar la hoja mientras el perfil carga.
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
  const releaseNotesSheet = useSheetParam(RELEASE_NOTES_SHEET_KEY)
  const openSheetKey = useSearchParams().get(SHEET_QUERY_KEY)
  const sheetOpen = releaseNotesSheet.open
  const setSheetOpen = releaseNotesSheet.setOpen
  const markedVersion = useRef<string | null>(null)
  const wasShown = useRef(false)

  const outcome = resolveReleaseNotesOutcome({
    serverSeenVersion: lastSeenVersion,
    cachedSeenVersion,
    currentVersion: LATEST_RELEASE_VERSION,
    entries: RELEASE_NOTES,
  })
  const open = outcome.action === "show" && sheetOpen

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

  // La ruta solo admite una hoja: «Novedades» espera a que se cierre la otra.
  // Una vez marcada en esta sesión no vuelve a abrirse, aunque el perfil no la
  // haya guardado todavía.
  useEffect(() => {
    if (outcome.action !== "show" || sheetOpen || openSheetKey !== null) {
      return
    }
    if (markedVersion.current === LATEST_RELEASE_VERSION) {
      return
    }
    setSheetOpen(true)
  }, [outcome.action, openSheetKey, setSheetOpen, sheetOpen])

  // Un enlace a esta hoja sin novedades que mostrar deja la URL limpia.
  useEffect(() => {
    if (outcome.action === "show" || outcome.action === "wait" || !sheetOpen) {
      return
    }
    setSheetOpen(false)
  }, [outcome.action, setSheetOpen, sheetOpen])

  // Cerrar la hoja, sea con «Entendido» o con Atrás, marca la versión actual.
  useEffect(() => {
    if (open) {
      wasShown.current = true
      return
    }
    if (!wasShown.current) {
      return
    }
    wasShown.current = false
    markCurrentVersionSeen()
  }, [open, markCurrentVersionSeen])

  return (
    <BottomSheet
      open={open}
      variant="floating"
      onOpenChange={(next) => {
        if (!next) {
          setSheetOpen(false)
        }
      }}
      title="Novedades"
      description={
        outcome.action === "show"
          ? `Cambios desde la versión ${outcome.sinceVersion}`
          : undefined
      }
    >
      {outcome.action === "show" ? (
        <div className="flex flex-col gap-4">
          {outcome.entries.map((entry) => (
            <section key={entry.version} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Versión {entry.version}
              </h3>
              <ul className="flex flex-col gap-2">
                {entry.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2 rounded-md border border-border/30 bg-card p-2 text-sm shadow-sm"
                  >
                    <SparklesIcon
                      className="mt-0.5 size-4 shrink-0 text-success"
                      aria-hidden
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {outcome.olderCount > 0 ? (
            <p className="text-xs text-muted-foreground">
              {describeHiddenVersions(outcome.olderCount)}
            </p>
          ) : null}
        </div>
      ) : null}
      <Button
        className="flex-1 rounded-full py-2"
        onClick={() => setSheetOpen(false)}
      >
        <CheckIcon data-icon="inline-start" />
        Entendido
      </Button>
    </BottomSheet>
  )
}
