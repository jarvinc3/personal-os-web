"use client"

import { useLastSeenReleaseVersion } from "@/src/modules/settings/hooks/use-last-seen-release-version"
import { useMarkReleaseNotesSeen } from "@/src/modules/settings/hooks/use-mark-release-notes-seen"
import { ReleaseNotesSheet } from "@/src/shared/components/layout/release-notes-sheet"

export function ReleaseNotes() {
  const lastSeenVersion = useLastSeenReleaseVersion()
  const markSeen = useMarkReleaseNotesSeen()

  return (
    <ReleaseNotesSheet
      lastSeenVersion={lastSeenVersion}
      onMarkSeen={markSeen}
    />
  )
}
