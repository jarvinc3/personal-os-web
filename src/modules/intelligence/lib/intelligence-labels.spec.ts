import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  emailSocketStatusLabel,
  emailSocketStatusText,
} from "./intelligence-labels.ts"

describe("emailSocketStatusText", () => {
  it("keeps the badge text of each socket state", () => {
    assert.equal(emailSocketStatusText("connected"), "Canal en vivo")
    assert.equal(emailSocketStatusText("connecting"), "Conectando canal")
    assert.equal(emailSocketStatusText("disconnected"), "Canal sin conexión")
  })
})

describe("emailSocketStatusLabel", () => {
  it("keeps the accessible label of each socket state", () => {
    assert.equal(
      emailSocketStatusLabel("connected"),
      "Canal de actualizaciones en vivo. No indica la salud de Gmail."
    )
    assert.equal(
      emailSocketStatusLabel("connecting"),
      "Conectando el canal de actualizaciones. No indica la salud de Gmail."
    )
    assert.equal(
      emailSocketStatusLabel("disconnected"),
      "Canal de actualizaciones sin conexión. No indica la salud de Gmail."
    )
  })
})
