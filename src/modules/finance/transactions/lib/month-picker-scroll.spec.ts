import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  centeredScrollLeft,
  monthPickerScrollBehavior,
} from "./month-picker-scroll.ts"

describe("centeredScrollLeft", () => {
  it("centers a chip that starts to the right of the strip", () => {
    assert.equal(
      centeredScrollLeft({
        listScrollLeft: 0,
        listLeft: 100,
        listWidth: 400,
        chipLeft: 700,
        chipWidth: 80,
      }),
      440
    )
  })

  it("keeps the strip still when the chip is already centered", () => {
    assert.equal(
      centeredScrollLeft({
        listScrollLeft: 440,
        listLeft: 100,
        listWidth: 400,
        chipLeft: 260,
        chipWidth: 80,
      }),
      440
    )
  })
})

describe("monthPickerScrollBehavior", () => {
  it("places the first month without animating", () => {
    assert.equal(monthPickerScrollBehavior(false), "auto")
  })

  it("glides the strip when the month changes later", () => {
    assert.equal(monthPickerScrollBehavior(true), "smooth")
  })
})
