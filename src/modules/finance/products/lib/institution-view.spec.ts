import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  INSTITUTION_VIEW_STORAGE_KEY,
  isInstitutionView,
  readInstitutionView,
  writeInstitutionView,
} from "./institution-view.ts"

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

describe("institution-view", () => {
  it("opens stacked when nothing is stored", () => {
    assert.equal(readInstitutionView(memoryStorage().storage), "stacked")
  })

  it("opens stacked without storage, as on the server", () => {
    assert.equal(readInstitutionView(null), "stacked")
  })

  it("reads back the view it wrote", () => {
    const { storage } = memoryStorage()
    writeInstitutionView("carousel", storage)
    assert.equal(readInstitutionView(storage), "carousel")
  })

  it("falls back to stacked when the stored value is not a view", () => {
    const { store, storage } = memoryStorage()
    store.set(INSTITUTION_VIEW_STORAGE_KEY, "expanded")
    assert.equal(readInstitutionView(storage), "stacked")
  })

  it("ignores values that are not views", () => {
    assert.equal(isInstitutionView("stacked"), true)
    assert.equal(isInstitutionView("carousel"), true)
    assert.equal(isInstitutionView(null), false)
    assert.equal(isInstitutionView("carousel "), false)
  })

  it("writes nothing without storage", () => {
    const { store } = memoryStorage()
    writeInstitutionView("carousel", null)
    assert.equal(store.size, 0)
  })
})
