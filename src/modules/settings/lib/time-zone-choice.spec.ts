import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  readTimeZoneChoice,
  TIME_ZONE_CHOICE_STORAGE_KEY,
  writeTimeZoneChoice,
} from "./time-zone-choice.ts"

function memoryStorage() {
  const store = new Map<string, string>()
  return {
    store,
    storage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
    },
  }
}

describe("time-zone-choice", () => {
  it("treats a fresh browser as undecided", () => {
    assert.equal(readTimeZoneChoice(memoryStorage().storage), false)
  })

  it("remembers the zone the app stored", () => {
    const { store, storage } = memoryStorage()
    writeTimeZoneChoice("America/La_Paz", storage)
    assert.equal(readTimeZoneChoice(storage), true)
    assert.equal(store.get(TIME_ZONE_CHOICE_STORAGE_KEY), "America/La_Paz")
  })

  it("does nothing without storage, as on the server", () => {
    assert.equal(readTimeZoneChoice(null), true)
    writeTimeZoneChoice("America/La_Paz", null)
  })
})
