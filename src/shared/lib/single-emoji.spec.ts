import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { isSingleEmoji, takeSingleEmoji } from "./single-emoji.ts"

describe("isSingleEmoji", () => {
  it("accepts one emoji grapheme", () => {
    assert.equal(isSingleEmoji("🛒"), true)
    assert.equal(isSingleEmoji("❤️"), true)
  })

  it("rejects letters and more than one grapheme", () => {
    assert.equal(isSingleEmoji("abc"), false)
    assert.equal(isSingleEmoji("ab🛒"), false)
    assert.equal(isSingleEmoji("🛒🍔"), false)
    assert.equal(isSingleEmoji(""), false)
  })
})

describe("takeSingleEmoji", () => {
  it("keeps the first emoji and drops surrounding letters", () => {
    assert.equal(takeSingleEmoji("ab🛒"), "🛒")
    assert.equal(takeSingleEmoji("❤️ extra"), "❤️")
  })

  it("returns empty when there is no emoji", () => {
    assert.equal(takeSingleEmoji("abc"), "")
    assert.equal(takeSingleEmoji(""), "")
  })
})
