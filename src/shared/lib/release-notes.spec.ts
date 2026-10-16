import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"

import {
  LATEST_RELEASE_VERSION,
  RELEASE_NOTES,
  type ReleaseNotesEntry,
} from "@/src/shared/constants/release-notes.ts"

import {
  RELEASE_NOTES_SEEN_VERSION_KEY,
  findReleaseNotesEntry,
  markVersionSeen,
  readSeenVersion,
  resolveReleaseNotesOutcome,
  type ReleaseNotesStorage,
} from "./release-notes.ts"

const ENTRIES: readonly ReleaseNotesEntry[] = [
  { version: "0.40.0", highlights: ["Nota nueva"] },
  { version: "0.39.0", highlights: ["Nota vieja"] },
]

function createStorage(
  initial: Record<string, string> = {}
): ReleaseNotesStorage {
  const items = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return items.get(key) ?? null
    },
    setItem(key, value) {
      items.set(key, value)
    },
  }
}

describe("readSeenVersion / markVersionSeen", () => {
  it("roundtrips the seen version under the storage key", () => {
    const storage = createStorage()
    assert.equal(readSeenVersion(storage), null)

    markVersionSeen(storage, "0.40.0")

    assert.equal(readSeenVersion(storage), "0.40.0")
    assert.equal(storage.getItem(RELEASE_NOTES_SEEN_VERSION_KEY), "0.40.0")
  })
})

describe("findReleaseNotesEntry", () => {
  it("finds the entry by version and returns null when missing", () => {
    assert.equal(findReleaseNotesEntry(ENTRIES, "0.39.0")?.version, "0.39.0")
    assert.equal(findReleaseNotesEntry(ENTRIES, "1.0.0"), null)
  })
})

describe("resolveReleaseNotesOutcome", () => {
  it("marks the current version in silence on a first visit", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        seenVersion: null,
        currentVersion: "0.40.0",
        entries: ENTRIES,
      }),
      { action: "mark-seen" }
    )
  })

  it("shows the notes when the seen version is older", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        seenVersion: "0.39.0",
        currentVersion: "0.40.0",
        entries: ENTRIES,
      }),
      { action: "show", entry: ENTRIES[0] }
    )
  })

  it("does nothing when the current version was already seen", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        seenVersion: "0.40.0",
        currentVersion: "0.40.0",
        entries: ENTRIES,
      }),
      { action: "none" }
    )
  })

  it("marks the version in silence when it has no curated notes", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        seenVersion: "0.39.0",
        currentVersion: "0.41.0",
        entries: ENTRIES,
      }),
      { action: "mark-seen" }
    )
  })

  it("shows the sheet once and never again after closing it", () => {
    const storage = createStorage({
      [RELEASE_NOTES_SEEN_VERSION_KEY]: "0.39.0",
    })
    const options = { currentVersion: "0.40.0", entries: ENTRIES }

    const firstOutcome = resolveReleaseNotesOutcome({
      ...options,
      seenVersion: readSeenVersion(storage),
    })
    assert.equal(firstOutcome.action, "show")

    markVersionSeen(storage, options.currentVersion)
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        ...options,
        seenVersion: readSeenVersion(storage),
      }),
      { action: "none" }
    )
  })

  it("saves the current version on a first visit without showing the sheet", () => {
    const storage = createStorage()
    const options = { currentVersion: "0.40.0", entries: ENTRIES }

    const outcome = resolveReleaseNotesOutcome({
      ...options,
      seenVersion: readSeenVersion(storage),
    })
    assert.equal(outcome.action, "mark-seen")

    markVersionSeen(storage, options.currentVersion)
    assert.equal(readSeenVersion(storage), "0.40.0")
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        ...options,
        seenVersion: readSeenVersion(storage),
      }),
      { action: "none" }
    )
  })
})

describe("RELEASE_NOTES", () => {
  it("starts with the version of package.json", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
    ) as { version: string }

    assert.equal(LATEST_RELEASE_VERSION, packageJson.version)
    assert.equal(RELEASE_NOTES[0]?.version, packageJson.version)
  })

  it("lists each version once, newest first", () => {
    const versions = RELEASE_NOTES.map((entry) => entry.version)

    assert.equal(new Set(versions).size, versions.length)
  })

  it("writes at least one highlight per version", () => {
    for (const entry of RELEASE_NOTES) {
      assert.ok(entry.highlights.length > 0, `${entry.version} sin notas`)
    }
  })
})
