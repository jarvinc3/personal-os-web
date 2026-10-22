import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  BLACK_TEXT,
  contrastRatio,
  getPrimaryColorTokens,
  normalizeHexColor,
  readableTextColor,
  WHITE_TEXT,
} from "@/src/shared/appearance/color.ts"
import { PRIMARY_COLORS } from "@/src/shared/appearance/primary-colors.ts"

describe("normalizeHexColor", () => {
  it("expands three digits and returns uppercase", () => {
    assert.equal(normalizeHexColor("#abc"), "#AABBCC")
    assert.equal(normalizeHexColor(" #a1b2c3 "), "#A1B2C3")
  })

  it("rejects values that are not a six or three digit hex", () => {
    assert.equal(normalizeHexColor("red"), null)
    assert.equal(normalizeHexColor("#12345"), null)
    assert.equal(normalizeHexColor("#1234567"), null)
    assert.equal(normalizeHexColor(null), null)
  })
})

describe("readableTextColor", () => {
  it("picks white text on a dark color", () => {
    assert.equal(readableTextColor("#3F6A9A"), WHITE_TEXT)
  })

  it("picks black text on a light color", () => {
    assert.equal(readableTextColor("#D6C5B3"), BLACK_TEXT)
  })

  it("keeps at least AA contrast for every curated color", () => {
    for (const option of PRIMARY_COLORS) {
      const contrast = contrastRatio(option.hex, readableTextColor(option.hex))

      assert.ok(
        contrast >= 4.5,
        `${option.label} quedó con contraste ${contrast.toFixed(2)}`
      )
    }
  })

  it("measures the maximum contrast between black and white", () => {
    assert.equal(contrastRatio(BLACK_TEXT, WHITE_TEXT).toFixed(2), "21.00")
  })
})

describe("getPrimaryColorTokens", () => {
  it("normalizes the color and pairs it with a readable foreground", () => {
    assert.deepEqual(getPrimaryColorTokens("#d6c5b3"), {
      primary: "#D6C5B3",
      primaryForeground: BLACK_TEXT,
      ring: "#D6C5B3",
    })
  })

  it("fails fast on an invalid color", () => {
    assert.throws(() => getPrimaryColorTokens("nope"))
  })
})
