import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  LATEST_RELEASE_VERSION,
  RELEASE_NOTES,
  type ReleaseNotesEntry,
} from "@/src/shared/constants/release-notes.ts"

import {
  RELEASE_NOTES_SEEN_VERSION_KEY,
  compareReleaseVersions,
  hasVisibleReleaseNotes,
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

function quiet(version: string): ReleaseNotesEntry {
  return {
    version,
    highlights: [
      "Sin cambios visibles: esta versión solo ordena detalles internos.",
    ],
  }
}

function visible(version: string): ReleaseNotesEntry {
  return { version, highlights: [`Nota de ${version}`] }
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

describe("compareReleaseVersions", () => {
  it("orders by number, not by text", () => {
    assert.ok(compareReleaseVersions("0.58.10", "0.58.9") > 0)
    assert.ok(compareReleaseVersions("0.58.9", "0.58.10") < 0)
    assert.ok(compareReleaseVersions("0.59.0", "0.58.99") > 0)
    assert.ok(compareReleaseVersions("0.58.8", "0.58.8") === 0)
  })

  it("fails on a version that is not X.Y.Z", () => {
    assert.throws(() => compareReleaseVersions("0.58", "0.58.8"))
    assert.throws(() => compareReleaseVersions("0.58.8", "v0.58.8"))
  })
})

describe("hasVisibleReleaseNotes", () => {
  it("hides a version whose notes only report an internal change", () => {
    assert.equal(hasVisibleReleaseNotes(quiet("0.39.0")), false)
  })

  it("keeps a version with at least one visible note", () => {
    assert.equal(hasVisibleReleaseNotes(visible("0.40.0")), true)
    assert.equal(
      hasVisibleReleaseNotes({
        version: "0.40.0",
        highlights: [
          "Sin cambios visibles: detalle interno.",
          "Hay una pantalla nueva.",
        ],
      }),
      true
    )
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

  it("shows every unseen version with visible notes, newest first", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: "0.39.0",
        cachedSeenVersion: null,
        currentVersion: CURRENT_VERSION,
        entries: ENTRIES,
      }),
      {
        action: "show",
        sinceVersion: "0.39.0",
        entries: [ENTRIES[0]],
        olderCount: 0,
      }
    )
  })

  it("lists the versions between the seen one and the current one", () => {
    const entries = [
      visible("0.58.8"),
      quiet("0.58.7"),
      visible("0.58.6"),
      visible("0.58.5"),
      visible("0.58.2"),
    ]

    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: "0.58.2",
        cachedSeenVersion: null,
        currentVersion: "0.58.8",
        entries,
      }),
      {
        action: "show",
        sinceVersion: "0.58.2",
        entries: [entries[0], entries[2], entries[3]],
        olderCount: 0,
      }
    )
  })

  it("orders by version number even when the seen one has no entry", () => {
    const entries = [visible("0.58.10"), visible("0.58.9"), visible("0.58.8")]

    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: "0.58.8",
        cachedSeenVersion: null,
        currentVersion: "0.58.10",
        entries,
      }),
      {
        action: "show",
        sinceVersion: "0.58.8",
        entries: [entries[0], entries[1]],
        olderCount: 0,
      }
    )
  })

  it("marks the version in silence when nothing unseen has visible notes", () => {
    const entries = [quiet("0.40.0"), quiet("0.39.1"), visible("0.39.0")]

    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: "0.39.0",
        cachedSeenVersion: null,
        currentVersion: "0.40.0",
        entries,
      }),
      { action: "mark-seen" }
    )
  })

  it("keeps the ten newest versions and counts the rest", () => {
    const entries = Array.from({ length: 13 }, (_, index) =>
      visible(`0.${60 - index}.0`)
    )

    const outcome = resolveReleaseNotesOutcome({
      serverSeenVersion: "0.47.0",
      cachedSeenVersion: null,
      currentVersion: "0.60.0",
      entries,
    })

    assert.equal(outcome.action, "show")
    if (outcome.action !== "show") {
      return
    }
    assert.equal(outcome.entries.length, 10)
    assert.equal(outcome.entries[0].version, "0.60.0")
    assert.equal(outcome.entries[9].version, "0.51.0")
    assert.equal(outcome.olderCount, 3)
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

  it("marks the version in silence when there are no notes after it", () => {
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: "0.41.0",
        cachedSeenVersion: null,
        currentVersion: "0.41.0",
        entries: ENTRIES,
      }),
      { action: "none" }
    )
    assert.deepEqual(
      resolveReleaseNotesOutcome({
        serverSeenVersion: "0.39.0",
        cachedSeenVersion: null,
        currentVersion: "0.41.0",
        entries: ENTRIES,
      }),
      {
        action: "show",
        sinceVersion: "0.39.0",
        entries: [ENTRIES[0]],
        olderCount: 0,
      }
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
      {
        action: "show",
        sinceVersion: "0.39.0",
        entries: [ENTRIES[0]],
        olderCount: 0,
      }
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
    for (let index = 1; index < versions.length; index += 1) {
      assert.ok(
        compareReleaseVersions(versions[index - 1], versions[index]) > 0,
        `${versions[index - 1]} debe ir antes de ${versions[index]}`
      )
    }
  })

  it("writes at least one highlight per version", () => {
    for (const entry of RELEASE_NOTES) {
      assert.ok(entry.highlights.length > 0, `${entry.version} sin notas`)
    }
  })
})
