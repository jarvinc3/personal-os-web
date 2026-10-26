import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { shortMessageId } from "@/src/modules/intelligence/message-id"

describe("id corto del correo", () => {
  it("toma los primeros ocho caracteres del uuid", () => {
    assert.equal(
      shortMessageId("3f9a1c7e-2b44-4d1a-9c1e-7a0d0f6b2c11"),
      "3f9a1c7e"
    )
  })

  it("deja el id tal cual si ya es corto", () => {
    assert.equal(shortMessageId("abc"), "abc")
    assert.equal(shortMessageId(""), "")
  })
})
