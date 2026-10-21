import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { remainingCaption, withCurrency } from "./planning-captions.ts"

const DISPLAY = { currency: "USD", showCents: true, compactNumbers: false }

describe("remainingCaption", () => {
  it("says nothing while a side is missing", () => {
    assert.equal(
      remainingCaption({
        current: null,
        target: 100,
        display: DISPLAY,
        reached: "Meta alcanzada",
        prefix: "Faltan",
      }),
      undefined
    )
    assert.equal(
      remainingCaption({
        current: 10,
        target: null,
        display: DISPLAY,
        reached: "Meta alcanzada",
        prefix: "Faltan",
      }),
      undefined
    )
  })

  it("shows the reached message once the target is met or passed", () => {
    const base = {
      display: DISPLAY,
      reached: "Meta alcanzada",
      prefix: "Faltan",
    }
    assert.equal(
      remainingCaption({ ...base, current: 100, target: 100 }),
      "Meta alcanzada"
    )
    assert.equal(
      remainingCaption({ ...base, current: 150, target: 100 }),
      "Meta alcanzada"
    )
  })

  it("shows what is left in the display currency", () => {
    const caption = remainingCaption({
      current: 40,
      target: 100,
      display: DISPLAY,
      reached: "Meta alcanzada",
      prefix: "Faltan",
    })

    assert.equal(caption, "Faltan USD $60.00")
  })
})

describe("withCurrency", () => {
  it("keeps the display settings and swaps the currency", () => {
    assert.deepEqual(withCurrency(DISPLAY, "DOP"), {
      ...DISPLAY,
      currency: "DOP",
    })
  })
})
