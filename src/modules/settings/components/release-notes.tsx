"use client"

import { useReleaseNotesSeen } from "@/src/modules/settings/hooks/use-release-notes-seen"
import { ReleaseNotesSheet } from "@/src/shared/components/layout/release-notes-sheet"

export function ReleaseNotes() {
  const { lastSeenVersion, markSeen } = useReleaseNotesSeen()

  return (
    <ReleaseNotesSheet
      lastSeenVersion={lastSeenVersion}
      onMarkSeen={markSeen}
    />
  )
}
