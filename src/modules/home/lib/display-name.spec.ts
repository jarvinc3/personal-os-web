import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveHomeDisplayName } from "./display-name.ts"

describe("resolveHomeDisplayName", () => {
  it("prefiere el nombre del perfil", () => {
    assert.equal(
      resolveHomeDisplayName({
        profileFullName: "Ana",
        userFullName: "Beatriz",
      }),
      "Ana"
    )
  })

  it("usa el usuario de la sesión sin nombre de perfil", () => {
    assert.equal(
      resolveHomeDisplayName({
        profileFullName: null,
        userFullName: "Beatriz",
      }),
      "Beatriz"
    )
  })

  it("cae al genérico sin perfil ni usuario", () => {
    assert.equal(resolveHomeDisplayName({}), "Usuario")
    assert.equal(
      resolveHomeDisplayName({
        profileFullName: null,
        userFullName: undefined,
      }),
      "Usuario"
    )
  })
})
