import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  LATEST_RELEASE_VERSION,
  RELEASE_NOTES,
  type ReleaseNotesEntry,
} from "@/src/shared/constants/release-notes.ts"

import {
  RELEASE_NOTES_SEEN_VERSION_KEY,
  findReleaseNotesEntry,
  readCachedSeenVersion,
  resolveReleaseNotesOutcome,
  writeCachedSeenVersion,
  type ReleaseNotesStorage,
} from "./release-notes.ts"

const CURRENT_VERSION = "0.40.0"

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

describe("readCachedSeenVersion / writeCachedSeenVersion", () => {
  it("roundtrips the seen version under the storage key", () => {
    const storage = createStorage()
    assert.equal(readCachedSeenVersion(storage), null)

    writeCachedSeenVersion(storage, CURRENT_VERSION)

    assert.equal(readCachedSeenVersion(storage), CURRENT_VERSION)
    assert.equal(
      storage.getItem(RELEASE_NOTES_SEEN_VERSION_KEY),
      CURRENT_VERSION
    )
  })
})

describe("findReleaseNotesEntry", () => {
  it("finds the entry by version and returns null when missing", () => {
    assert.equal(findReleaseNotesEntry(ENTRIES, "0.39.0")?.version, "0.39.0")
    assert.equal(findReleaseNotesEntry(ENTRIES, "1.0.0"), null)
  })
})

describe("resolveReleaseNotesOutcome", () => {
  it("waits while the profile loads and the cache has no current version", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: undefined,
        cachedSeenVersion: null,
        currentVersion: CURRENT_VERSION,
        entries: ENTRIES,
      }),
      { action: "wait" }
    )
  })

  it("waits while the profile loads and the cache is older", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: undefined,
        cachedSeenVersion: "0.39.0",
        currentVersion: CURRENT_VERSION,
        entries: ENTRIES,
      }),
      { action: "wait" }
    )
  })

  it("does nothing while the profile loads when the cache saw the current version", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: undefined,
        cachedSeenVersion: CURRENT_VERSION,
        currentVersion: CURRENT_VERSION,
        entries: ENTRIES,
      }),
      { action: "none" }
    )
  })

  it("marks the current version in silence on a first visit", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: null,
        cachedSeenVersion: null,
        currentVersion: CURRENT_VERSION,
        entries: ENTRIES,
      }),
      { action: "mark-seen" }
    )
  })

  it("lets the profile win over the cache", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: null,
        cachedSeenVersion: CURRENT_VERSION,
        currentVersion: CURRENT_VERSION,
        entries: ENTRIES,
      }),
      { action: "mark-seen" }
    )
  })

  it("shows the notes when the seen version is older", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: "0.39.0",
        cachedSeenVersion: null,
        currentVersion: CURRENT_VERSION,
        entries: ENTRIES,
      }),
      { action: "show", entry: ENTRIES[0] }
    )
  })

  it("does nothing when the current version was already seen", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: CURRENT_VERSION,
        cachedSeenVersion: null,
        currentVersion: CURRENT_VERSION,
        entries: ENTRIES,
      }),
      { action: "none" }
    )
  })

  it("marks the version in silence when it has no curated notes", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: "0.39.0",
        cachedSeenVersion: null,
        currentVersion: "0.41.0",
        entries: ENTRIES,
      }),
      { action: "mark-seen" }
    )
  })

  it("shows the sheet once and never again after marking it", () => {
    const storage = createStorage({
      [RELEASE_NOTES_SEEN_VERSION_KEY]: "0.39.0",
    })
    const options = { currentVersion: CURRENT_VERSION, entries: ENTRIES }

    assert.deepEqual(
      resolveReleaseNotesOutcome({
        ...options,
        serverSeenVersion: readCachedSeenVersion(storage),
        cachedSeenVersion: readCachedSeenVersion(storage),
      }),
      { action: "show", entry: ENTRIES[0] }
    )

    writeCachedSeenVersion(storage, options.currentVersion)
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        ...options,
        serverSeenVersion: options.currentVersion,
        cachedSeenVersion: readCachedSeenVersion(storage),
      }),
      { action: "none" }
    )
  })
})

describe("RELEASE_NOTES", () => {
  it("keeps the latest published notes entry first", () => {
    assert.equal(LATEST_RELEASE_VERSION, RELEASE_NOTES[0]?.version)
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
