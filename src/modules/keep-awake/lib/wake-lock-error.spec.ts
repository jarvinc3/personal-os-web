import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  classifyWakeLockError,
  wakeLockFailureMessage,
} from "./wake-lock-error.ts"

describe("classifyWakeLockError", () => {
  it("detects missing API support", () => {
    const error = Object.assign(new Error("wakeLock is not available"), {
      name: "NotSupportedError",
    })
    assert.equal(classifyWakeLockError(error), "unsupported")
  })

  it("detects a document that is not visible", () => {
    const error = Object.assign(
      new Error("Wake Lock may not be requested when the document is not visible"),
      { name: "NotAllowedError" }
    )
    assert.equal(classifyWakeLockError(error), "not_visible")
  })

  it("detects a permission rejection", () => {
    const error = Object.assign(new Error("Permission denied"), {
      name: "NotAllowedError",
    })
    assert.equal(classifyWakeLockError(error), "permission")
  })

  it("returns unknown for unrelated values", () => {
    assert.equal(classifyWakeLockError(null), "unknown")
    assert.equal(classifyWakeLockError("fail"), "unknown")
  })
})

describe("wakeLockFailureMessage", () => {
  it("returns distinct copy per failure kind", () => {
    assert.equal(wakeLockFailureMessage("unsupported").title, "No disponible")
    assert.match(wakeLockFailureMessage("permission").description, /permiso/i)
    assert.match(wakeLockFailureMessage("not_visible").description, /visible|pestaña/i)
    assert.match(wakeLockFailureMessage("released").description, /liber/i)
  })
})
