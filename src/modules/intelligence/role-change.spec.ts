import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { roleChange } from "./role-change.ts"

describe("roleChange", () => {
  it("subir de Usuario a Administrador agrega la revisión del conocimiento global", () => {
    const change = roleChange({ currentRole: "USER", nextRole: "ADMIN" })

    assert.deepEqual(change.gains, [
      "Revisar el conocimiento global: promover, revertir y cambiar roles",
    ])
    assert.equal(change.loses.length, 0)
  })

  it("bajar de Administrador a Usuario solo quita permisos", () => {
    const change = roleChange({ currentRole: "ADMIN", nextRole: "USER" })

    assert.equal(change.gains.length, 0)
    assert.equal(change.loses.length, 1)
  })

  it("Colaborador no agrega permisos sobre Usuario: la contribución va por consentimiento", () => {
    const change = roleChange({
      currentRole: "USER",
      nextRole: "CONTRIBUTOR",
    })

    assert.equal(change.gains.length, 0)
    assert.equal(change.loses.length, 0)
  })

  it("el mismo rol no cambia nada", () => {
    const change = roleChange({ currentRole: "ADMIN", nextRole: "ADMIN" })

    assert.equal(change.gains.length, 0)
    assert.equal(change.loses.length, 0)
  })
})
