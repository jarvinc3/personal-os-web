import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolvePortalContainer } from "./portal-container.tsx"

describe("resolvePortalContainer", () => {
  it("deja que el primitivo monte en document.body sin contenedor", () => {
    assert.equal(resolvePortalContainer(undefined, null), undefined)
  })

  it("usa el contenedor heredado cuando no hay uno explícito", () => {
    const inherited = {} as HTMLElement

    assert.equal(resolvePortalContainer(undefined, inherited), inherited)
  })

  it("prefiere el contenedor explícito", () => {
    const explicit = {} as HTMLElement
    const inherited = {} as HTMLElement

    assert.equal(resolvePortalContainer(explicit, inherited), explicit)
  })

  it("conserva el null explícito para esperar un contenedor", () => {
    const inherited = {} as HTMLElement

    assert.equal(resolvePortalContainer(null, inherited), null)
  })
})
