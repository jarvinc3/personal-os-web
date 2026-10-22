import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  APPEARANCE_STORAGE_KEY,
  parseCachedAppearance,
  readCachedAppearance,
  serializeCachedAppearance,
  writeCachedAppearance,
} from "@/src/shared/appearance/appearance-cache.ts"
import { isAppearanceStyleId } from "@/src/shared/appearance/style-registry.ts"

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

describe("parseCachedAppearance", () => {
  it("reads a valid cache", () => {
    const raw = serializeCachedAppearance({
      style: "studio",
      primaryColor: "#3f6a9a",
    })

    assert.deepEqual(parseCachedAppearance(raw, isAppearanceStyleId), {
      style: "studio",
      primaryColor: "#3F6A9A",
    })
  })

  it("ignores a cache from another version", () => {
    const raw = JSON.stringify({
      version: 99,
      style: "studio",
      primaryColor: "#D6C5B3",
      primaryForeground: "#000000",
    })

    assert.equal(parseCachedAppearance(raw, isAppearanceStyleId), null)
  })

  it("ignores an unknown style", () => {
    const raw = JSON.stringify({
      version: 1,
      style: "missing",
      primaryColor: "#D6C5B3",
      primaryForeground: "#000000",
    })

    assert.equal(parseCachedAppearance(raw, isAppearanceStyleId), null)
  })

  it("ignores an invalid color", () => {
    const raw = JSON.stringify({
      version: 1,
      style: "studio",
      primaryColor: "sand",
      primaryForeground: "#000000",
    })

    assert.equal(parseCachedAppearance(raw, isAppearanceStyleId), null)
  })

  it("ignores corrupt JSON", () => {
    assert.equal(parseCachedAppearance("{", isAppearanceStyleId), null)
  })
})

describe("readCachedAppearance and writeCachedAppearance", () => {
  it("round-trips the appearance through storage", () => {
    const storage = createStorage()

    writeCachedAppearance(storage, {
      style: "studio",
      primaryColor: "#D6C5B3",
    })

    assert.deepEqual(readCachedAppearance(storage, isAppearanceStyleId), {
      style: "studio",
      primaryColor: "#D6C5B3",
    })
  })

  it("serializes the readable foreground for the first paint", () => {
    const raw = serializeCachedAppearance({
      style: "studio",
      primaryColor: "#3F6A9A",
    })

    assert.deepEqual(JSON.parse(raw), {
      version: 1,
      style: "studio",
      primaryColor: "#3F6A9A",
      primaryForeground: "#FFFFFF",
    })
  })

  it("reads the cache under its stable key", () => {
    const storage = createStorage({
      [APPEARANCE_STORAGE_KEY]: serializeCachedAppearance({
        style: "studio",
        primaryColor: "#C97B5A",
      }),
    })

    assert.deepEqual(readCachedAppearance(storage, isAppearanceStyleId), {
      style: "studio",
      primaryColor: "#C97B5A",
    })
  })
})
