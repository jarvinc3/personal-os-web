import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { roleChange } from "./role-change.ts"

describe("roleChange", () => {
  it("subir de Usuario a Administrador solo agrega permisos", () => {
    const change = roleChange({ currentRole: "USER", nextRole: "ADMIN" })

    assert.equal(change.gains.length, 2)
    assert.equal(change.loses.length, 0)
    assert.ok(
      change.gains.includes(
        "Revisar el conocimiento global: promover, revertir y cambiar roles"
      )
    )
  })

  it("bajar de Administrador a Usuario solo quita permisos", () => {
    const change = roleChange({ currentRole: "ADMIN", nextRole: "USER" })

    assert.equal(change.gains.length, 0)
    assert.equal(change.loses.length, 2)
    assert.ok(
      change.loses.includes("Aportar patrones anónimos al conocimiento global")
    )
  })

  it("Colaborador y Administrador comparten el aporte anónimo", () => {
    const change = roleChange({
      currentRole: "CONTRIBUTOR",
      nextRole: "ADMIN",
    })

    assert.deepEqual(change.gains, [
      "Revisar el conocimiento global: promover, revertir y cambiar roles",
    ])
    assert.equal(change.loses.length, 0)
  })

  it("el mismo rol no cambia nada", () => {
    const change = roleChange({ currentRole: "ADMIN", nextRole: "ADMIN" })

    assert.equal(change.gains.length, 0)
    assert.equal(change.loses.length, 0)
  })
})
