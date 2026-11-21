import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  getSettingValue,
  mergeWithDefaults,
  patchSettingValue,
} from "./settings-value.ts"

const DEFAULTS = {
  theme: { value: "system", style: "default" },
  regional: { weekStartsOn: null },
  tags: ["uno", "dos"],
}

describe("mergeWithDefaults", () => {
  it("sin datos clona los valores por defecto", () => {
    const merged = mergeWithDefaults(null, DEFAULTS)

    assert.deepEqual(merged, DEFAULTS)
    assert.notEqual(merged, DEFAULTS)
  })

  it("un objeto vacío también devuelve los valores por defecto", () => {
    assert.deepEqual(mergeWithDefaults({}, DEFAULTS), DEFAULTS)
  })

  it("conserva los hermanos por defecto de un objeto anidado", () => {
    const merged = mergeWithDefaults({ theme: { value: "dark" } }, DEFAULTS)

    assert.equal(merged.theme.value, "dark")
    assert.equal(merged.theme.style, "default")
    assert.equal(merged.regional.weekStartsOn, null)
  })

  it("no sobrescribe con undefined", () => {
    const merged = mergeWithDefaults({ theme: { value: undefined } }, DEFAULTS)

    assert.equal(merged.theme.value, "system")
  })

  it("reemplaza el arreglo completo", () => {
    const merged = mergeWithDefaults({ tags: ["tres"] }, DEFAULTS)

    assert.deepEqual(merged.tags, ["tres"])
  })

  it("ignora un valor que no es un objeto", () => {
    assert.deepEqual(mergeWithDefaults("texto", DEFAULTS), DEFAULTS)
  })

  it("no muta los valores por defecto", () => {
    const merged = mergeWithDefaults({ theme: { value: "light" } }, DEFAULTS)

    assert.equal(DEFAULTS.theme.value, "system")
    assert.equal(merged.theme.value, "light")
  })
})

describe("getSettingValue", () => {
  it("lee el valor del nodo", () => {
    assert.equal(getSettingValue({ fieldGuide: "guía", value: 3 }), 3)
  })
})

describe("patchSettingValue", () => {
  it("cambia el valor y conserva la guía sin mutar el nodo", () => {
    const node = { fieldGuide: "guía", value: 1 }
    const next = patchSettingValue(node, 2)

    assert.equal(next.value, 2)
    assert.equal(next.fieldGuide, "guía")
    assert.equal(node.value, 1)
    assert.notEqual(next, node)
  })
})
