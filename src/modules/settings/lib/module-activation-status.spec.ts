import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  moduleActivationLabel,
  pendingActivation,
} from "./module-activation-status.ts"

describe("moduleActivationLabel", () => {
  it("says active once the change is saved", () => {
    assert.equal(
      moduleActivationLabel({
        state: "enabled",
        savedIsEnabled: true,
        pendingEnabled: null,
      }),
      "Activo"
    )
  })

  it("says pending while the switch is on without saving", () => {
    assert.equal(
      moduleActivationLabel({
        state: "disabled",
        savedIsEnabled: false,
        pendingEnabled: true,
      }),
      "Pendiente de guardar"
    )
  })

  it("says pending while a saved module is being turned off", () => {
    assert.equal(
      moduleActivationLabel({
        state: "enabled",
        savedIsEnabled: true,
        pendingEnabled: false,
      }),
      "Pendiente de guardar"
    )
  })

  it("goes back to the saved label when the switch matches it", () => {
    assert.equal(
      moduleActivationLabel({
        state: "enabled",
        savedIsEnabled: true,
        pendingEnabled: true,
      }),
      "Activo"
    )
    assert.equal(
      moduleActivationLabel({
        state: "disabled",
        savedIsEnabled: false,
        pendingEnabled: false,
      }),
      "Desactivado"
    )
  })

  it("keeps an unconfigured module out of the pending state", () => {
    assert.equal(
      moduleActivationLabel({
        state: "unconfigured",
        savedIsEnabled: false,
        pendingEnabled: true,
      }),
      "Sin configurar"
    )
  })
})

describe("pendingActivation", () => {
  it("shares the new value only while it differs from the saved one", () => {
    assert.equal(pendingActivation(false, true), true)
    assert.equal(pendingActivation(true, false), false)
    assert.equal(pendingActivation(true, true), null)
    assert.equal(pendingActivation(false, false), null)
  })
})
