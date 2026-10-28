import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { isAuthFormLocked, resolveAuthFormGate } from "./auth-form-gate.ts"

const LABELS = {
  idleLabel: "Iniciar sesión",
  pendingLabel: "Ingresando...",
}

describe("isAuthFormLocked", () => {
  it("locks the form until React hydrates", () => {
    assert.equal(isAuthFormLocked({ hydrated: false, isPending: false }), true)
  })

  it("locks the form while the mutation runs", () => {
    assert.equal(isAuthFormLocked({ hydrated: true, isPending: true }), true)
  })

  it("unlocks the form once hydrated and idle", () => {
    assert.equal(isAuthFormLocked({ hydrated: true, isPending: false }), false)
  })
})

describe("resolveAuthFormGate", () => {
  it("shows a preparing state before hydration", () => {
    assert.deepEqual(
      resolveAuthFormGate({
        hydrated: false,
        isPending: false,
        isGooglePending: false,
        ...LABELS,
      }),
      { isLocked: true, primaryLabel: "Preparando…", primaryBusy: true }
    )
  })

  it("shows the pending label while the login runs", () => {
    assert.deepEqual(
      resolveAuthFormGate({
        hydrated: true,
        isPending: true,
        isGooglePending: false,
        ...LABELS,
      }),
      { isLocked: true, primaryLabel: LABELS.pendingLabel, primaryBusy: true }
    )
  })

  it("locks the idle label while Google connects", () => {
    assert.deepEqual(
      resolveAuthFormGate({
        hydrated: true,
        isPending: false,
        isGooglePending: true,
        ...LABELS,
      }),
      { isLocked: true, primaryLabel: LABELS.idleLabel, primaryBusy: false }
    )
  })

  it("leaves the primary action ready when hydrated and idle", () => {
    assert.deepEqual(
      resolveAuthFormGate({
        hydrated: true,
        isPending: false,
        isGooglePending: false,
        ...LABELS,
      }),
      { isLocked: false, primaryLabel: LABELS.idleLabel, primaryBusy: false }
    )
  })
})
