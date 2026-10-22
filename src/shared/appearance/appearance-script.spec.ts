import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { serializeCachedAppearance } from "@/src/shared/appearance/appearance-cache.ts"
import { APPEARANCE_SCRIPT } from "@/src/shared/appearance/appearance-script.ts"

function createRoot() {
  const attributes = new Map<string, string>()
  const properties = new Map<string, string>()

  return {
    attributes,
    properties,
    setAttribute: (name: string, value: string) => {
      attributes.set(name, value)
    },
    style: {
      setProperty: (name: string, value: string) => {
        properties.set(name, value)
      },
    },
  }
}

function runScript(raw: string | null) {
  const root = createRoot()
  const localStorage = { getItem: () => raw }
  const document = { documentElement: root }

  new Function("localStorage", "document", APPEARANCE_SCRIPT)(
    localStorage,
    document
  )

  return root
}

describe("APPEARANCE_SCRIPT", () => {
  it("applies the cached style and color before the first paint", () => {
    const raw = serializeCachedAppearance({
      style: "studio",
      primaryColor: "#3F6A9A",
    })

    const root = runScript(raw)

    assert.equal(root.attributes.get("data-style"), "studio")
    assert.equal(root.properties.get("--primary"), "#3F6A9A")
    assert.equal(root.properties.get("--primary-foreground"), "#FFFFFF")
    assert.equal(root.properties.get("--ring"), "#3F6A9A")
  })

  it("leaves the default appearance when there is no cache", () => {
    const root = runScript(null)

    assert.equal(root.attributes.size, 0)
    assert.equal(root.properties.size, 0)
  })

  it("ignores a style that is not in the registry", () => {
    const raw = JSON.stringify({
      version: 1,
      style: "missing",
      primaryColor: "#D6C5B3",
      primaryForeground: "#000000",
    })

    const root = runScript(raw)

    assert.equal(root.attributes.size, 0)
  })

  it("survives a corrupt cache", () => {
    const root = runScript("{")

    assert.equal(root.attributes.size, 0)
  })
})
